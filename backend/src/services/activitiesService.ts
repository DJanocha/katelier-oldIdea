import { AppError } from 'src/utils';
import { Activity, IActivity } from 'src/models/activities';
import { isPointOfTimeOccupiedByAnyActivity } from 'src/utils/isPointOfTimeOccupiedByAnyActivity';

const mergeDateTime = ({ time, date }: { time: Date; date: Date }) => {
  const merged = new Date(time);
  merged.setFullYear(date.getFullYear());
  merged.setMonth(date.getMonth());
  merged.setDate(date.getDate());
  return merged;
};

export const createEvent = async (newActivity: IActivity & { date: Date }) => {
  const { start_time, stop_time, name, description, date, color } = newActivity;

  const start = mergeDateTime({ date, time: start_time });
  const stop = mergeDateTime({ date, time: stop_time });
  const startTimeNotOk = await isPointOfTimeOccupiedByAnyActivity(start);
  const stopTimeNotOk = await isPointOfTimeOccupiedByAnyActivity(stop);

  if (startTimeNotOk || stopTimeNotOk || date == undefined) {
    throw new AppError('invalid time provided. Maybe already occupied?', 400);
  }
  const theNewActivity = new Activity(newActivity);
  await theNewActivity.save();
};
