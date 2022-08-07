import express from 'express';
import { addCategory, createOne, deleteOne, getAll, getOne, updateOne } from 'src/controllers/categoriesController';
import { projectsRouter } from 'src/routes/projectsRouter';
import { requireArtist, requireLogin } from 'src/controllers/auth';
import { Project, Category, Step } from 'src/models';
import { stopParentFromHavingInvalidChildrens } from 'src/utils/';

const restrictInvalidProjects = stopParentFromHavingInvalidChildrens({
  parentModel: Category,
  childrenModel: Project
});

const router = express.Router();
router.use(requireLogin, requireArtist);

router.route('/').get(getAll).post(restrictInvalidProjects, createOne);

router.route('/new').post(addCategory);

router.route('/:id').get(getOne).delete(deleteOne).patch(restrictInvalidProjects, updateOne);

router.use('/:categoryId/projects', projectsRouter);

export default router;
