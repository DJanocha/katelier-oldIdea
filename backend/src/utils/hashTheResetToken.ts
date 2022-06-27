import { createHash } from 'crypto';

export const hashTheResetToken = (token: string) => createHash('sha256').update(token).digest('hex');
