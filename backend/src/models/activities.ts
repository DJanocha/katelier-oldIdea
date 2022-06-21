import { Schema, model, Types } from 'mongoose';
// import { MaterialSchema, MaterialType } from './materials';

type ActivityType = {
  name: string;
  color: string;
  date: Date; // null (it's a template) or Date object (it's put on callendar)
  start_time: string; // e.g. '12:25'
  stop_time: string;
  description: string;
  step_id: Types.ObjectId;
};

const ActivitySchema = new Schema<ActivityType>({
  name: {
    type: String,
    required: [
      // eslint-disable-next-line no-unused-vars
      function (this: ActivityType) {
        if (this.step_id) {
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
  date: Date,
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
  step_id: {
    type: Schema.Types.ObjectId,
    ref: 'Step',
    validate: [
      // eslint-disable-next-line no-unused-vars
      function (this: ActivityType) {
        console.log({ datata: this.date });
        return this.date !== undefined;
      },
      'Cannot assign activity to step without giving the date'
    ]
  }
});

// ActivitySchema.virtual('isTemplate').get(function () {
//   return this.date == null;
// }); cos takiego chyba nalezaloby dodac,

const Activity = model<ActivityType>('Activity', ActivitySchema);
export default Activity;
