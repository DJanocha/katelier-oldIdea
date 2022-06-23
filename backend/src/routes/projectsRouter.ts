import express from 'express';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne
} from 'src/controllers/projectsController';
import { stopParentFromHavingInvalidChildrens } from 'src/utils';
import { Step, Project } from 'src/models';

const router = express.Router();

const checkStepsValid = stopParentFromHavingInvalidChildrens({
  childrenModel: Step,
  parentModel: Project
});

router.route('/').get(getAll).post(checkStepsValid, createOne);

router
  .route('/:id')
  .delete(deleteOne)
  .get(getOne)
  .patch(checkStepsValid, updateOne);

export default router;
