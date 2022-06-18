import Step from '../models/steps';
import { generateHandlers } from '../utils/handlersGenerator';
const { createOne, deleteOne, getAll, getOne, updateOne } = generateHandlers({
  model: Step
});

export { getAll, createOne, getOne, updateOne, deleteOne };
