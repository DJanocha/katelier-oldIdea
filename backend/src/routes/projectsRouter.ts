import express from 'express';
import { createOne, deleteOne, getAll, getOne, updateOne } from 'src/controllers/projectsController';
import { stopParentFromHavingInvalidChildrens } from 'src/utils';
import { Step, Project } from 'src/models';
import { requireLogin, requireArtist } from 'src/controllers/auth';

const router = express.Router();

const checkStepsValid = stopParentFromHavingInvalidChildrens({
  childrenModel: Step,
  parentModel: Project
});

router.use(requireLogin, requireArtist);

router.route('/').get(getAll).post(checkStepsValid, createOne);

router.route('/:id').delete(deleteOne).get(getOne).patch(checkStepsValid, updateOne);

export default router;
