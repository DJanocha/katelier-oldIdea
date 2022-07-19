import { Activity } from 'src/models';
export const isPointOfTimeOccupiedByAnyActivity = async (point: Date) => {
  const foundColisions = await Activity.find({
    date: {
      $exists: true
    },
    stop_time: {
      $gte: point
    },
    start_time: {
      $lte: point
    }
  });
  return foundColisions.length > 0;
};
