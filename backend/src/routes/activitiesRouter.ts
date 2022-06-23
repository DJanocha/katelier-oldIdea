import express from 'express';

import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne
} from 'src/controllers/activitiesController';

const router = express.Router();

router.route('/').get(getAll).post(createOne);

router.route('/:id').get(getOne).delete(deleteOne).patch(updateOne);

export default router;
