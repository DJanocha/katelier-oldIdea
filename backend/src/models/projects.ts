import { Schema, model, Types } from 'mongoose';

export type ProjectType = {
  name: string;
  description: string;
  steps: Types.ObjectId[];
  client_info: string;
};

const ProjectSchema = new Schema<ProjectType>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  steps: { type: [Schema.Types.ObjectId], default: [], ref: 'Step' },
  client_info: String
});

const Project = model<ProjectType>('Project', ProjectSchema);
export default Project;
