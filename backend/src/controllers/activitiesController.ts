import { Activity } from 'src/models';
import { generateHandlers } from 'src/utils';

const { createOne, deleteOne, getAll, getOne, updateOne } = generateHandlers({
  model: Activity
});

export { createOne, deleteOne, getAll, getOne, updateOne };
