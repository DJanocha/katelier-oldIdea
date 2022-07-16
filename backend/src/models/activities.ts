import { Schema, model, Types, Document, Model } from 'mongoose';
import { isDateValid } from 'src/utils';
import { validateTime } from 'src/utils/validators';
import { StepModel } from './steps';

export interface IActivity {
  name?: string;
  color?: string;
  date?: Date; // null (it's a template) or Date object (it's put on callendar)
  start_time: string; // e.g. '12:25'
  stop_time: string;
  description?: string;
  step?: Types.ObjectId;
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
// export type ActivityModel = ActivityDocument;
export interface ActivityModel extends Model<IActivity> {
  getTemplates(): Promise<ActivityDocument[]>;
}

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
      type: Date,
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
      validate: {
        validator: validateTime,
        message: 'invalid start time'
      }
    },
    stop_time: {
      type: String,
      required: [true, 'Start time is required'],
      validate: {
        validator: validateTime,
        message: 'invalid stop time'
      }
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
  return this.date == null && this.step == null;
});
ActivitySchema.statics.getTemplates = async function (this: ActivityModel) {
  return await this.find().where('date').equals(undefined).where('step').equals(undefined);
};
ActivitySchema.index(
  { date: 1, name: 1 },
  {
    unique: true,
    ignoreUndefined: false
  }
);
export const Activity = model<ActivityDocument, ActivityModel>('Activity', ActivitySchema);

export const Activity = model<ActivityDocument>('Activity', ActivitySchema);
