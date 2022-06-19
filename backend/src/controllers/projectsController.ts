import Project from '../models/projects';
import { generateHandlers } from '../utils/handlersGenerator';
const { createOne, deleteOne, getAll, getOne, updateOne } = generateHandlers({
  model: Project
});

export { createOne, deleteOne, getAll, getOne, updateOne };
