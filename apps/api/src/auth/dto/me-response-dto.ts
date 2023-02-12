import { PickType } from '@nestjs/swagger';
import { UserEntity } from '../../users/entities/user.entity';
export const userMeResponseKeys: (keyof UserEntity)[] = [
  'id',
  'name',
  'tel',
  'email',
  'ig',
  'facebook',
  'image',
  'role',
];
export class MeResponseDto extends PickType(UserEntity, userMeResponseKeys) {}
