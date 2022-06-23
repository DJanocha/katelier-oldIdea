import { Category } from 'src/models';
import { generateHandlers } from 'src/utils';

const { createOne, deleteOne, getAll, getOne, updateOne } = generateHandlers({
  model: Category
});

export { createOne, deleteOne, getAll, getOne, updateOne };
