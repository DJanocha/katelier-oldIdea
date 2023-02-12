import { OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class LoginDto extends OmitType(CreateUserDto, ['passwordConfirm']) {}
