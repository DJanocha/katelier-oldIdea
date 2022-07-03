import { generateHandlers } from 'src/utils';
import { User } from 'src/models';

const { deleteOne, getAll, getOne } = generateHandlers({
  model: User
});

export { deleteOne, getAll, getOne };
