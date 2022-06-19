import Category from '../models/categories';
import { generateHandlers } from '../utils/handlersGenerator';

const { createOne, deleteOne, getAll, getOne, updateOne } = generateHandlers({
  model: Category
});

export { createOne, deleteOne, getAll, getOne, updateOne };
