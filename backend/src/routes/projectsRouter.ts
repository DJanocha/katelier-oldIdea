import express from 'express';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne
} from '../controllers/projectsController';
import { checkStepsValid } from '../utils/checkStepsIdsValid';
const router = express.Router();

router.route('/').get(getAll).post(checkStepsValid, createOne);

router
  .route('/:id')
  .delete(deleteOne)
  .get(getOne)
  .patch(checkStepsValid, updateOne);

export default router;
