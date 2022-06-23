import { Material } from 'src/models';
import { generateHandlers } from 'src/utils';
const { createOne, deleteOne, getAll, getOne, updateOne } = generateHandlers({
  model: Material
});

export { getAll, createOne, getOne, updateOne, deleteOne };
