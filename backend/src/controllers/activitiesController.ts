import Activity from '../models/activities';
import { generateHandlers } from '../utils/handlersGenerator';

const { createOne, deleteOne, getAll, getOne, updateOne } = generateHandlers({
  model: Activity
});

export { createOne, deleteOne, getAll, getOne, updateOne };
