import { generateHandlers } from 'src/utils';
import { Client } from 'src/models';

const { createOne, deleteOne, getAll, getOne, updateOne } = generateHandlers({
  model: Client
});

export { createOne, deleteOne, getAll, getOne, updateOne };
