import { Activity } from 'src/models';
import { catchAsync, generateHandlers } from 'src/utils';
import * as service from 'src/services/activitiesService';
import { RequestHandler } from 'express';
import { Types } from 'mongoose';
const { createOne, deleteOne, getAll, getOne, updateOne } = generateHandlers({
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
const createEvent: RequestHandler = catchAsync(async (req, res, next) => {
  const elements = await service.createEvent({});
  return res.status(200).json({ ok: true, data: elements });
});
/**
 * const getTemplates = ()=>{
 * return Activities.getTemplates()
 * }
 * i powyzej jest prosta logika, ale jesli chcemy utworzyc szablon,
 * bedzie juz trochee cieezeej, ponieewaz:
 *
 * const createTemplate = async(name:string, start_time: string, stop_time:string)=>{
 * const startTimeOccupiedByOtherTemplate = await
 * }
 */

export { createOne, deleteOne, getAll, getOne, updateOne, getAllTemplates, getAllEvents };
