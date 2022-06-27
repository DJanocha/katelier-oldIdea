import express from 'express';
import { getAll, getOne, deleteOne, updateOne } from 'src/controllers/usersControllers';
import { requireLogin, requireArtist } from 'src/controllers/auth';

const router = express.Router();

router.use(requireLogin, requireArtist);
router.route('/').get(getAll);
router.route('/:id').get(getOne).delete(deleteOne).patch(updateOne);

export default router;
