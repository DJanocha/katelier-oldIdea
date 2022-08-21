
import express from 'express';

import {getAllEvents, createEvent, deleteActivity, updateActivity, getOneActivity} from 'src/controllers/activitiesController';
import { requireArtist, requireLogin } from 'src/controllers/auth';

const router = express.Router();
router.use(requireLogin, requireArtist);

router.route('/').get(getAllEvents).post(createEvent);

router.route('/:id').get(getOneActivity).delete(deleteActivity).patch(updateActivity);

export default router