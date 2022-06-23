import express from 'express';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne
} from 'src/controllers/categoriesController';
import { Project, Category } from 'src/models';
import { stopParentFromHavingInvalidChildrens } from 'src/utils/';

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
