import Material from '../models/materials';
import { generateHandlers } from '../utils/handlersGenerator';
const { createOne, deleteOne, getAll, getOne, updateOne } = generateHandlers({
  model: Material
});

export { getAll, createOne, getOne, updateOne, deleteOne };
