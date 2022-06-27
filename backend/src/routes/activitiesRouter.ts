import express from 'express';

import { createOne, deleteOne, getAll, getOne, updateOne } from 'src/controllers/activitiesController';
import { requireArtist, requireLogin } from 'src/controllers/auth';

const router = express.Router();
router.use(requireLogin, requireArtist);

router.route('/').get(getAll).post(createOne);

router.route('/:id').get(getOne).delete(deleteOne).patch(updateOne);

export default router;
