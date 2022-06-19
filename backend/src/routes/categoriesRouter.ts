import express from 'express';

import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne
} from '../controllers/categoriesController';
import Category from '../models/categories';
import Project from '../models/projects';
import { stopParentFromHavingInvalidChildrens } from '../utils/checkStepsIdsValid';

const restrictInvalidProjects = stopParentFromHavingInvalidChildrens({
  parentModel: Category,
  childrenModel: Project
});

const router = express.Router();

router.route('/').get(getAll).post(restrictInvalidProjects, createOne);

router
  .route('/:id')
  .get(getOne)
  .delete(deleteOne)
  .patch(restrictInvalidProjects, updateOne);

export default router;
