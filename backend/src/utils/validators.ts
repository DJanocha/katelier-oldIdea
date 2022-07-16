export const validateTime = (time: string) => {
  if (time.length !== 5) {
    return false;
  }
  const [hoursStr, minutesStr] = time.split(':');
  if (hoursStr.length !== 2 || minutesStr.length !== 2) {
    return false;
  }
  const hours = parseInt(hoursStr.slice(0, 2));
  const minutes = parseInt(minutesStr.slice(0, 2));
  if (isNaN(hours) || isNaN(minutes)) {
    return false;
  }
  if (hours < 0 || hours > 24 || minutes < 0 || minutes > 59) {
    return false;
  }
  return true;
};
