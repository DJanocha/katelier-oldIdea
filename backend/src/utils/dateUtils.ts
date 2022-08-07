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
