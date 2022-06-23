import { Project } from 'src/models';
import { generateHandlers } from 'src/utils';
const { createOne, deleteOne, getAll, getOne, updateOne } = generateHandlers({
  model: Project
});

export { createOne, deleteOne, getAll, getOne, updateOne };
