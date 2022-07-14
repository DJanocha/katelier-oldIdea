export const validateTime = (time: string) => {
  const [hoursStr, minutesStr] = time.split(':');
  if (hoursStr.length !== 2 || minutesStr.length !== 2) {
    return false;
  }
  const hours = parseInt(hoursStr.slice(0, 2));
  const minutes = parseInt(minutesStr.slice(0, 2));
  if (hours < 0 || hours > 24 || minutes < 0 || minutes > 59) {
    return false;
  }
  return true;
};
