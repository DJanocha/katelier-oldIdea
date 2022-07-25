import { Schema, model, Types, Document } from 'mongoose';
import { AppError } from 'src/utils';
import { Project, ProjectModel } from './projects';
export interface ICategory {
  name: string;
  description: string;
  color: string;
  icon: string;
  projects: Types.ObjectId[];
}

export interface CategoryDocument extends ICategory, Document {
  projects: Types.Array<ProjectModel['_id']>;
  addProject(newProjectName: string): Promise<void>;
}
export interface CategoryDocumentWithProjects extends CategoryDocument {
  projects: Types.Array<ProjectModel>;
}

/*Now it can be as a type. If you want to add some 
static functions, you better change
it to interface */
export type CategoryModel = CategoryDocument;

const CategorySchema = new Schema<CategoryDocument, CategoryModel>({
  name: {
    type: String,
    required: [true, 'Category needs to have a name']
  },
  color: String,
  icon: String,
  projects: {
    type: [Schema.Types.ObjectId],
    default: [],
    ref: 'Project'
  },
  description: String
});

CategorySchema.methods.addProject = async function (this: CategoryDocument, newProjectName: string) {
  const { projects } = await this.populate('projects');
  const projectNameOccupied = projects.map((p) => p.name).includes(newProjectName);
  if (projectNameOccupied) {
    throw new AppError('Category already contains a project with given name', 400);
  }
  const newProject = new Project({ name: newProjectName, category: this._id });
  await newProject.save();
  this.projects.push(newProject._id);
  await this.save();
};

export const Category = model<CategoryDocument>('Category', CategorySchema);
