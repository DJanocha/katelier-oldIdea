import Achievement from '../models/achievement';
import { generateHandlers } from '../utils/handlersGenerator';
// const catchAsync = () => {}

const { createOne, deleteOne, getAll, getOne, updateOne } = generateHandlers({
  model: Achievement
});

export { getAll, createOne, getOne, updateOne, deleteOne };
