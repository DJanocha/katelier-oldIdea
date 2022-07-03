import express from 'express';
import { getAll, getOne, deleteOne } from 'src/controllers/usersControllers';
import { requireLogin, requireArtist } from 'src/controllers/auth';

const router = express.Router();

router.use(requireLogin);
router.use(requireArtist);

router.route('/').get(getAll);
router.route('/:id').get(getOne).delete(deleteOne);

export default router;
