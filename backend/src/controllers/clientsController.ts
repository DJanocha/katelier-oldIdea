import { generateHandlers } from '../utils/handlersGenerator';
import Client from '../models/clients';

const { createOne, deleteOne, getAll, getOne, updateOne } = generateHandlers({
  model: Client
});

export { createOne, deleteOne, getAll, getOne, updateOne };
