import express from 'express';
const router = express.Router();
import { getAll, createOne, getOne } from '../controllers/materialsController';

router.route('/').get(getAll).post(createOne);
router.route('/:id').get(getOne);

export default router;
