type DateParams = {
  hours?: number;
  minutes?: number;
};
export const newDate = (params?: DateParams) => {
  const now = new Date();
  if (!params) {
    return now;
  }
  const { hours = 0, minutes = 0 } = params;
  now.setHours(hours, minutes);
  return now;
};

export const mergeDateTime = ({ time, date }: { time: Date; date: Date }) => {
  const merged = new Date(time);
  merged.setFullYear(date.getFullYear());
  merged.setMonth(date.getMonth());
  merged.setDate(date.getDate());
  return merged;
};