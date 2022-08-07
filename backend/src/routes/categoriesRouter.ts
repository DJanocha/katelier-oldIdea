import express from 'express';
import { addCategory, createOne, deleteOne, getAll, getOne, updateOne } from 'src/controllers/categoriesController';
import { requireArtist, requireLogin } from 'src/controllers/auth';
import { Project, Category, Step } from 'src/models';
import { AppError, catchAsync, stopParentFromHavingInvalidChildrens } from 'src/utils/';

const restrictInvalidProjects = stopParentFromHavingInvalidChildrens({
  parentModel: Category,
  childrenModel: Project
});

const router = express.Router();
router.use(requireLogin, requireArtist);

router.route('/').get(getAll).post(restrictInvalidProjects, createOne);

router.route('/new').post(addCategory);

router.route('/:id').get(getOne).delete(deleteOne).patch(restrictInvalidProjects, updateOne);

router.route('/:categoryName/populateSteps').get(
  catchAsync(async (req, res, next) => {
    console.log({ r: req.params });
    const steps = await Step.find().populate({ path: 'project' });
    return res.json({ ready: false, steps });
  })
);
router.route('/:categoryName/projects/').get(
  catchAsync(async (req, res, next) => {
    const { categoryName } = req.params;
    if (!categoryName) {
      return next(new AppError('invalid path, try other one', 404));
    }
    const projects = await Project.find({ categoryName });
    const allProjects = await Project.find();
    return res.json({
      results: projects.length,
      projects,
      allProjects,
      allProjectsLength: allProjects.length
    });
  })
);
router.route('/:categoryName/projects/:projectName/steps').get(
  catchAsync(async (req, res, next) => {
    const { categoryName, projectName } = req.params;
    if (!categoryName || !projectName) {
      return next(new AppError('invalid path, try other one', 404));
    }
    const steps = await Step.find({
      categoryName,
      projectName
    });
    return res.json({ results: steps.length, steps });
  })
);
export default router;
