import mongoose from 'mongoose';
const { Schema, model } = mongoose;

type ProjectType = {
  name: string;
  description: string;
  steps: mongoose.Types.ObjectId[];
  client_info: string;
};

const ProjectSchema = new Schema<ProjectType>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  steps: { type: [mongoose.Schema.Types.ObjectId], default: [], ref: 'Step' },
  client_info: {
    type: String
  }
});

const Project = model<ProjectType>('Project', ProjectSchema);
export default Project;
