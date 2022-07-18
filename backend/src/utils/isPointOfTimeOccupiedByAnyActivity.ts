import { Activity } from 'src/models';
export const isPointOfTimeOccupiedByAnyActivity = async (point: Date) => {
  const foundColisions = await Activity.find({
    date: {
      $exists: true
    },
    stop_time: {
      $gt: point
    },
    start_time: {
      $lt: point
    }
  });
  return foundColisions.length > 0;
};
