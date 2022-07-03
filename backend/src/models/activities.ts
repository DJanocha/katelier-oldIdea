import { Schema, model, Types, Document } from 'mongoose';
import { isDateValid } from 'src/utils';
import { StepModel } from './steps';

export interface IActivity {
  name: string;
  color: string;
  date: string; // null (it's a template) or Date object (it's put on callendar)
  start_time: string; // e.g. '12:25'
  stop_time: string;
  description: string;
  step: Types.ObjectId;
}

export interface ActivityDocument extends IActivity, Document {
  step: StepModel['_id'];
}
export interface ActivityDocumentWithStep extends ActivityDocument {
  step: StepModel;
  isTemplate(): boolean;
}

/*Now it can be as a type. If you want to add some 
static functions, you better change
it to interface */
export type ActivityModel = ActivityDocument;

const ActivitySchema = new Schema<ActivityDocument, ActivityModel>(
  {
    name: {
      type: String,
      required: [
        // eslint-disable-next-line no-unused-vars
        function (this: IActivity) {
          if (this.step) {
            return false;
          }
          return true;
        },
        'Name is required'
      ],
      maxlength: [20, 'Name can be 20 characters long at max']
    },
    color: String,
    description: { type: String },
    date: {
      type: String,
      validate: [
        // eslint-disable-next-line no-unused-vars
        function (this: IActivity) {
          return isDateValid(this.date);
        },
        'Date has to be in format: YYYY-MM-DD'
      ]
    },
    start_time: {
      type: String,
      required: [true, 'Start time is required'],

      maxlength: [5, 'Name can be 5 characters long at max']
    },
    stop_time: {
      type: String,
      required: [true, 'Start time is required'],
      length: [5, 'Name can be 5 characters long at max']
    },
    step: {
      type: Schema.Types.ObjectId,
      ref: 'Step',
      validate: [
        // eslint-disable-next-line no-unused-vars
        function (this: IActivity) {
          return this.date !== undefined;
        },
        'Cannot assign activity to step without giving the date'
      ]
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

ActivitySchema.virtual('isTemplate').get(function () {
  return this.date == null;
});

export const Activity = model<ActivityDocument, ActivityModel>('Activity', ActivitySchema);
