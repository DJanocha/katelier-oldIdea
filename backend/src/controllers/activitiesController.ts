import { Activity } from 'src/models';
import { generateHandlers } from 'src/utils';

const { createOne, deleteOne, getAll, getOne, updateOne } = generateHandlers({
  model: Activity
});
/**
 * const getTemplates = ()=>{
 * return Activities.getTemplates()
 * }
 * i powyzej jest prosta logika, ale jesli chcemy utworzyc szablon,
 * bedzie juz trochee cieezeej, ponieewaz:
 *
 * const createTemplate = async(name:string, start_time: string, stop_time:string)=>{
 * const startTimeOccupiedByOtherTemplate = await
 * }
 */

export { createOne, deleteOne, getAll, getOne, updateOne };
