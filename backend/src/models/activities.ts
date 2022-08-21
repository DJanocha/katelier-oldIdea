import { Schema, model, Types, Document, Model } from 'mongoose';
import { StepModel } from './steps';

export interface IActivity {
  name?: string;
  color?: string;
  date?: Date; // null (it's a template) or Date object (it's put on callendar)
  start_time: Date;
  stop_time: Date;
  description?: string;
  step?: Types.ObjectId;
  userId: Types.ObjectId;
}

export interface ActivityDocument extends IActivity, Document {
  step: StepModel['_id'];
  isTemplate(): boolean;
}
export interface ActivityDocumentWithStep extends ActivityDocument {
  step: StepModel;
}

/*Now it can be as a type. If you want to add some 
static functions, you better change
it to interface */
// export type ActivityModel = ActivityDocument;
export interface ActivityModel extends Model<IActivity> {
  getTemplates(): Promise<ActivityDocument[]>;
  getEvents(): Promise<ActivityDocument[]>;
}

const ActivitySchema = new Schema<ActivityDocument, ActivityModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
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
      maxlength: [50, 'Name can be 50 characters long at max']
    },
    color: String,
    description: { type: String },
    date: {
      type: Date
    },
    start_time: {
      type: Date,
      required: [true, 'Start time is required']
    },
    stop_time: {
      type: Date,
      required: [true, 'Start time is required']
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
  return await this.find().where('date').equals(undefined);
};
ActivitySchema.statics.getEvents = async function (this: ActivityModel) {
  return await this.find().where('date').ne(undefined);
};
/**
 *
 * ale jesli nie damy await, to zwrocimy queryObjet, po ktory mozna wykorzsytac tak
 *   jak zwykly find?
 *   np :
 * const templatesCount = await Activity.getTemplates().count()
 *
 * albo:
 *
 * await Activity.getTemplates().where('date_start').gt(date.now())
 * ?? przeszloby? do zbadania!
 *
 * alboo:
 *
 * await Activity.findEvents()
 * .where('date_start')
 * .gt(<begginingOfThisMonth>)
 * .where('date_stop)
 * .lt(<endOfThisMonth>)
 *
 */
ActivitySchema.index(
  { name: 1, userId: 1, date: 1 },
  {
    unique: true,
    ignoreUndefined: false
  }
);
export const Activity = model<ActivityDocument, ActivityModel>('Activity', ActivitySchema);
