import { Schema, model, Types } from 'mongoose';
// import { MaterialSchema, MaterialType } from './materials';

type ActivityType = {
  name: string;
  date: Date; // null (it's a template) or Date object (it's put on callendar)
  start_time: string; // e.g. '12:25'
  stop_time: string;
  description: string;
};

const ActivitySchema = new Schema<ActivityType>({
  name: { type: String, required: [true, 'Name is required'] },
  description: { type: String },
  date: Date,
  start_time: { type: String, required: [true, 'Start time is required'] },
  stop_time: { type: String, required: [true, 'Start time is required'] }
});

const Activity = model<ActivityType>('Activity', ActivitySchema);
export default Activity;
