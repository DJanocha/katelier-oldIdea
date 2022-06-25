import { generateHandlers } from 'src/utils';
import { User } from 'src/models';

const { createOne, deleteOne, getAll, getOne, updateOne } = generateHandlers({
  model: User
});

export { createOne, deleteOne, getAll, getOne, updateOne };
