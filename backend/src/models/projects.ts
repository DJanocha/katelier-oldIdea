import { Schema, model, Types, Document } from 'mongoose';
import { Activity } from './activities';
import { IStep, Step, StepModel } from './steps';

export interface IProject {
  name: string;
  description: string;
  steps: Types.ObjectId[];
  client_info: string;
  category: Types.ObjectId;
}

export interface ProjectDocument extends IProject, Document {
  steps: Types.Array<StepModel['_id']>;
  addStep(newStepData: NewStepData): Promise<void>;
}
type NewStepData = {
  date: Date;
  startTime: string;
  stopTime: string;
};

export interface ProjectDocumentsWithSteps extends ProjectDocument {
  steps: Types.Array<StepModel>;
}

/*Now it can be as a type. If you want to add some 
static functions, you better change
it to interface */
export type ProjectModel = ProjectDocument;

const ProjectSchema = new Schema<ProjectDocument, ProjectModel>({
  name: {
    type: String,
    required: true
  },
  description: String,
  steps: { type: [Schema.Types.ObjectId], default: [], ref: 'Step' },
  client_info: String,
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true }
});

ProjectSchema.methods.addStep = async function (this: ProjectDocument, newStepData: NewStepData) {
  const stepsQuantity = this.steps.length;
  const { date, startTime: start_time, stopTime: stop_time } = newStepData;
  const newActivity = new Activity({ date, start_time, stop_time });
  const newStep = new Step<IStep>({
    category: this.category,
    project: this._id,
    step_number: stepsQuantity,
    activity: newActivity._id
  });
  newActivity.step = newStep._id;
  await newActivity.save();
  await newStep.save();
};

export const Project = model<ProjectDocument>('Project', ProjectSchema);
