import { Schema, model, Types, Document } from 'mongoose';
import { StepModel } from './steps';

export interface IProject {
  name: string;
  description: string;
  steps: Types.ObjectId[];
  client_info: string;
}

export interface ProjectDocument extends IProject, Document {
  steps: Types.Array<StepModel['_id']>;
}

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
    required: true,
    unique: true
  },
  description: String,
  steps: { type: [Schema.Types.ObjectId], default: [], ref: 'Step' },
  client_info: String
});

export const Project = model<ProjectDocument, ProjectModel>('Project', ProjectSchema);
