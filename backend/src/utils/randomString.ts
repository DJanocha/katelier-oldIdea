const randomNumber = (max: number | undefined = 10000): number => Math.floor(Math.random() * max) + 1;
const randomSign = () => String.fromCharCode(randomNumber());

export const getRandomString = (length = 20): string =>
  new Array(length)
    .fill(null)
    .map(() => randomSign())
    .join('');
