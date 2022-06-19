import express from 'express';
const router = express.Router();
import {
  getAll,
  createOne,
  getOne,
  deleteOne,
  updateOne
} from '../controllers/clientsController';

router.route('/').get(getAll).post(createOne);
router.route('/:id').get(getOne).delete(deleteOne).patch(updateOne);

export default router;
