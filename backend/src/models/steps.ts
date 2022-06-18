import mongoose from 'mongoose';
//todo
const { Schema, model } = mongoose;
import { MaterialSchema, MaterialType } from './materials';

type StepType = {
  category: string;
  project: string;
  step_number: number;
  img: string;
  path: string;
  public_path: string;
  used_materials: MaterialType[];
  start_time: Date;
  stop_time: Date;
  description: string;
};

const StepSchema = new Schema<StepType>({
  category: { type: String, required: true },
  project: { type: String, required: true },
  step_number: { type: Number, required: true },
  description: { type: String },
  img: String,
  path: String,
  public_path: String,
  start_time: Date,
  stop_time: Date,
  used_materials: { type: [MaterialSchema], default: [] }
});

const Step = model<StepType>('Step', StepSchema);
export default Step;
