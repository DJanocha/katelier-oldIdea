
import express from 'express';

import { createOne, deleteOne, getOne, updateOne, getAllEvents} from 'src/controllers/activitiesController';
import { requireArtist, requireLogin } from 'src/controllers/auth';

const router = express.Router();
router.use(requireLogin, requireArtist);

router.route('/').get(getAllEvents).post(createOne);

router.route('/:id').get(getOne).delete(deleteOne).patch(updateOne);

export default router