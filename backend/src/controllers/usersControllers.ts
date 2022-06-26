import { generateHandlers } from 'src/utils';
import { User } from 'src/models';

const { deleteOne, getAll, getOne, updateOne } = generateHandlers({
  model: User
});

export { deleteOne, getAll, getOne, updateOne };
