import express from 'express';
const router = express.Router();
import { getAll, getOne, deleteOne, updateOne } from 'src/controllers/usersControllers';

router.route('/').get(getAll);
router.route('/:id').get(getOne).delete(deleteOne).patch(updateOne);

export default router;
