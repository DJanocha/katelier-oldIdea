import { Schema, model, Types } from 'mongoose';
type CategoryType = {
  name: string;
  description: string;
  color: string;
  icon: string;
  projects: Types.ObjectId[];
};

const CategorySchema = new Schema<CategoryType>({
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

const Category = model<CategoryType>('Category', CategorySchema);

export default Category;
