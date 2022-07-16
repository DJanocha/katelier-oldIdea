import express from 'express';

import { createOne, deleteOne, getAll, getOne, updateOne } from 'src/controllers/activitiesController';
import { requireArtist, requireLogin } from 'src/controllers/auth';

const router = express.Router();
router.use(requireLogin, requireArtist);

router.route('/').get(getAll).post(createOne);

router.route('/:id').get(getOne).delete(deleteOne).patch(updateOne);

// plan "przejscie_na_service_layer"TODO: router stworzy w taki sposob, by
// wywolywal metody z kontrolera, ale metody w kontrolerze korzystalyby z
// serviceLayer

// router.route('/templates').get(activitesController.getTemplates)
// router.route('/events').get(activitiesController.getEvents)
// router.route('/todayEvents').get(activitiesController.getTodayEvents)
// router.route('/chosenDayEvents').get(activitiesController.getChosenDayEvents)
// router.route('/thisMonthEvents').get(activitiesController.getThisMonthEvents)
// router.route('/chosenMonthEvents').get(activitiesController.getChosenMonthEvents)

// router.route('/templates').post(activitiesController.createTemplate)
// router.route('/events').post(activitiesController.createEvent)

// router.route('/templates/:id').patch(activitiesController.updateTemplate)
// router.route('/events/:id').patch(activitiesController.updateEvent)

// router.route('/templates/:id').patch(activitiesController.updateTemplate)
// router.route('/events/:id').patch(activitiesController.updateEvent)

// router.route('/templates/:id').delete(activitiesController.deleteTemplate)
// router.route('/events/:id').delete(activitiesController.deleteEvent)
export default router;
