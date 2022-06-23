import express from 'express';
import {
  getAll,
  createOne,
  getOne,
  updateOne,
  deleteOne
} from 'src/controllers/stepsController';
const router = express.Router({});

router.route('/').get(getAll).post(createOne);

router.route('/:id').get(getOne).patch(updateOne).delete(deleteOne);

export default router;
