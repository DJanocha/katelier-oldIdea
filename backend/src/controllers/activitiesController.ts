import { Activity } from 'src/models';
import { catchAsync, generateHandlers } from 'src/utils';
import * as service from 'src/services/activitiesService';
import { RequestHandler } from 'express';
const {
  deleteOne: deleteActivity,
  updateOne: updateActivity,
  getOne: getOneActivity
} = generateHandlers({
  model: Activity
});

const getAllEvents: RequestHandler = catchAsync(async (req, res, next) => {
  const elements = await service.getEvents();
  return res.status(200).json({ ok: true, data: elements });
});

const getAllTemplates: RequestHandler = catchAsync(async (req, res, next) => {
  const elements = await service.getTemplates();
  return res.status(200).json({ ok: true, data: elements });
});
const createTemplate: RequestHandler = catchAsync(async (req, res, next) => {
  const newTemplate = req.body;
  const elements = await service.createTemplate(newTemplate);
  return res.status(200).json({ ok: true, data: elements });
});
const createEvent: RequestHandler = catchAsync(async (req, res, next) => {
  const newEvent = req.body;
  const elements = await service.createEvent(newEvent);
  return res.status(200).json({ ok: true, data: elements });
});

export { createEvent, createTemplate, deleteActivity, getAllTemplates, getAllEvents, updateActivity, getOneActivity };
