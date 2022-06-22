import { Schema, model, Types } from 'mongoose';
import { isDateValid } from '../utils/isDateValid';
// import { MaterialSchema, MaterialType } from './materials';

type ActivityType = {
  name: string;
  color: string;
  date: string; // null (it's a template) or Date object (it's put on callendar)
  start_time: string; // e.g. '12:25'
  stop_time: string;
  description: string;
  step: Types.ObjectId;
};

const ActivitySchema = new Schema<ActivityType>(
  {
    name: {
      type: String,
      required: [
        // eslint-disable-next-line no-unused-vars
        function (this: ActivityType) {
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
        function (this: ActivityType) {
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
      // validate: [
      //   // eslint-disable-next-line no-unused-vars
      //   function (this: unknown) {
      //     return this.name.length <= 20 (return true (validation passed) if name.length is not greater than 20. Reject if it's longer);
      //   },
      //   'custom errror'
      // // ],
      length: [5, 'Name can be 5 characters long at max']
    },
    step: {
      type: Schema.Types.ObjectId,
      ref: 'Step',
      validate: [
        // eslint-disable-next-line no-unused-vars
        function (this: ActivityType) {
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

const Activity = model<ActivityType>('Activity', ActivitySchema);
export default Activity;
