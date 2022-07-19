export const isDateValid = (val: Date | number | string | null | undefined) => {
  if (val === null || val === undefined) {
    return false;
  }
  return !Number.isNaN(new Date(val).valueOf());
};
