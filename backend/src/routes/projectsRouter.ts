import express from 'express';
import { createOne, deleteOne, getAll, getOne, updateOne } from 'src/controllers/projectsController';
import { stopParentFromHavingInvalidChildrens } from 'src/utils';
import { Step, Project } from 'src/models';
import { requireLogin, requireArtist } from 'src/controllers/auth';

/* mergeParams:true is required in child router in order to
have access to params from parent's router
*/
const router = express.Router({mergeParams: true});

const checkStepsValid = stopParentFromHavingInvalidChildrens({
  childrenModel: Step,
  parentModel: Project
});

router.use(requireLogin, requireArtist);

router.route('/').get(getAll).post(checkStepsValid, createOne);

router.route('/:id').delete(deleteOne).get(getOne).patch(checkStepsValid, updateOne);

export const projectsRouter = router;
export default router;
