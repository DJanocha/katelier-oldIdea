import { Schema, model, Types, Document } from 'mongoose';
import { ProjectModel } from './projects';
export interface ICategory {
  name: string;
  description: string;
  color: string;
  icon: string;
  projects: Types.ObjectId[];
}

export interface CategoryDocument extends ICategory, Document {
  projects: Types.Array<ProjectModel['_id']>;
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
    required: [true, 'Category needs to have a name'],
    unique: true
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

export const Category = model<CategoryDocument>('Category', CategorySchema);
