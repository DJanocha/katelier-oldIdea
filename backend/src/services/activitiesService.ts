
import { Types } from 'mongoose';
import { AppError, mergeDateTime } from 'src/utils';
import { Activity, IActivity } from 'src/models/activities';
import { isPointOfTimeOccupiedByAnyActivity } from 'src/utils/isPointOfTimeOccupiedByAnyActivity';
import { User } from 'src/models';
import { UserDocument } from 'src/models/users';


};

export const getEvents = async () => Activity.getEvents();
export const getTemplates = async () => Activity.getTemplates();
export const getActivities = async () => Activity.find();

export const createEvent = async (newEvent: IActivity & { date: Date; userId: Types.ObjectId }) => {
  const { start_time, stop_time, name, description, date, color, userId } = newEvent;
  const user = User.findById<UserDocument>(userId);

  if (!user) {
    throw new AppError('user not found. log in again please', 400);
  }

  const start = mergeDateTime({ date, time: start_time });
  const stop = mergeDateTime({ date, time: stop_time });
  const startTimeNotOk = await isPointOfTimeOccupiedByAnyActivity(start);
  const stopTimeNotOk = await isPointOfTimeOccupiedByAnyActivity(stop);

  if (startTimeNotOk || stopTimeNotOk || date == undefined) {
    throw new AppError('invalid time provided. Maybe already occupied?', 400);
  }
  const nameOccupied = await Activity.findOne()
    .where('date')
    .exists(true)
    .where('userId')
    .equals(userId)
    .where('name')
    .equals(name);
  if (nameOccupied) {
    throw new AppError('template name occupied. try another one', 400);
  }

  return Activity.create(newEvent);
};

export const createTemplate = async (newTemplate: Omit<IActivity, 'date'> & { userId: Types.ObjectId }) => {
  const { name, userId } = newTemplate;
  const user = User.findById<UserDocument>(userId);

  if (!user) {
    throw new AppError('user not found. log in again please', 400);
  }
  const nameOccupied = await Activity.findOne()
    .where('date')
    .exists(false)
    .where('userId')
    .equals(userId)
    .where('name')
    .equals(name);

  if (nameOccupied) {
    throw new AppError('template name occupied. try another one', 400);
  }

  return Activity.create(newTemplate);
};
