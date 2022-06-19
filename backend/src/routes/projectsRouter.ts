import express from 'express';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne
} from '../controllers/projectsController';
import { stopParentFromHavingInvalidChildrens } from '../utils/checkStepsIdsValid';
import Step from '../models/steps';
import Project from '../models/projects';

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
