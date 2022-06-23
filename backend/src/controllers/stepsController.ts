import { Step } from 'src/models';
import { generateHandlers } from 'src/utils';
const { createOne, deleteOne, getAll, getOne, updateOne } = generateHandlers({
  model: Step
});

export { getAll, createOne, getOne, updateOne, deleteOne };
