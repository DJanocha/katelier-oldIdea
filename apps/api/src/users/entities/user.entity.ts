import { User, UserRole } from '@prisma/client';
export class UserEntity implements User {
  id: string;
  name: string;
  tel: string | null;
  email: string;
  ig: string | null;
  facebook: string | null;
  image: string | null;
  role: UserRole;
  password: string;
  passwordChangedAt: Date | null;
  resetPassword: string | null;
  resetPasswordExpires: number | null;
  active: boolean;
}
