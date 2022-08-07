import { Schema, model, Types, Document } from 'mongoose';
import { AppError } from 'src/utils';
import { IProject, Project, ProjectDocument, ProjectModel } from './projects';
export interface ICategory {
  name: string;
  description: string;
  color: string;
  icon: string;
  projects: Types.ObjectId[];
}

export interface CategoryDocument extends ICategory, Document {
  projects: Types.Array<ProjectModel['_id']>;
  addProject(newProjectData: Partial<Pick<IProject, "name" | "description">>): Promise<ProjectDocument>;
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

CategorySchema.methods.addProject = async function (this: CategoryDocument, newProjectData: Partial<Pick<IProject, "name" | "description">>) {
  const { projects } = await this.populate('projects');
  const projectNameOccupied = projects.map((p) => p.name).includes(newProjectData.name);
  if (projectNameOccupied) {
    throw new AppError('Category already contains a project with given name', 400);
  }
  const newProject = new Project({ category: this._id, ...newProjectData });
  await newProject.save();
  this.projects.push(newProject._id);
  await this.save();
  return newProject;
};

export const Category = model<CategoryDocument>('Category', CategorySchema);
