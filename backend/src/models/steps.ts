import { Schema, model, Types } from 'mongoose';
// import { MaterialSchema, MaterialType } from './materials';

type StepType = {
  category: string;
  project: string;
  step_number: number;
  img: string;
  path: string;
  public_path: string;
  used_materials: Types.ObjectId[];
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
  used_materials: {
    type: [Schema.Types.ObjectId],
    ref: 'Material',
    default: []
  }
});

const Step = model<StepType>('Step', StepSchema);
export default Step;
