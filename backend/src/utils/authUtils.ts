const trimTo10 = (numberToTrim: number) => Number(`${numberToTrim}`.slice(0, 10));
export const isTokenOutdated = ({
  passwordChangedAt,
  iat,
  exp
}: {
  passwordChangedAt: any;
  iat: number;
  exp: number;
}): boolean => {
  if (!passwordChangedAt && !iat && !exp) {
    return false;
  }
  const now = trimTo10(Date.now());
  if (exp < now) {
    return true;
  }

  const changedAt = trimTo10(passwordChangedAt?.getTime());
  if (changedAt && changedAt > iat) {
    return true;
  }
  if (exp < now) {
    return true;
  }

  return false;
};
