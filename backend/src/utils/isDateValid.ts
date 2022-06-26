export const isDateValid = (val: Date | number | string) => !Number.isNaN(new Date(val).valueOf());
