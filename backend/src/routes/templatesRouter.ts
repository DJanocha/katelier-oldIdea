
import express from 'express';

import {getAllTemplates, createTemplate, deleteActivity, updateActivity, getOneActivity} from 'src/controllers/activitiesController';
import { requireArtist, requireLogin } from 'src/controllers/auth';

const router = express.Router();
router.use(requireLogin, requireArtist);

router.route('/').get(getAllTemplates).post(createTemplate);

router.route('/:id').get(getOneActivity).delete(deleteActivity).patch(updateActivity);

export default router