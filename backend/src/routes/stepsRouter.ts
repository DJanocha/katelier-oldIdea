import express from 'express';
import { getAll, createOne, getOne, updateOne, deleteOne } from 'src/controllers/stepsController';
import { requireLogin, requireArtist } from 'src/controllers/auth';

const router = express.Router({ mergeParams: true });

router.use(requireLogin, requireArtist);

router.route('/').get(getAll).post(createOne);

router.route('/:id').get(getOne).patch(updateOne).delete(deleteOne);

export const stepsRouter = router;

export default router;
