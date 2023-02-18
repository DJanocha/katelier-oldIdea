import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { PasswordMismatchException } from './exceptions/passwords-mismatch-exception';
import { pick } from 'lodash';
import { userMeResponseKeys } from './dto/me-response-dto';
import { PasswordEncoder } from './password-encoder';
import { omit } from 'lodash';
import { EmailOccupiedException } from './exceptions/email-occupied-exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<unknown> {
    const user = await this.usersService.findOne({ email });
    if (!user) {
      return null;
    }
    const passwordIsValid = PasswordEncoder.validatePassword({
      candidateRaw: password,
      encoded: user?.password,
    });
    if (!passwordIsValid) {
      return null;
    }
    const userDataToHide: (keyof typeof user)[] = [
      'password',
      'passwordChangedAt',
      'resetPassword',
      'resetPasswordExpires',
    ];
    return omit(user, userDataToHide);
  }

  async login(user: { email: string; userId: string }) {
    const payload = { email: user.email, usb: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserInput: CreateUserDto) {
    if (createUserInput.passwordConfirm !== createUserInput.password) {
      throw new PasswordMismatchException();
    }
    const emailIsOccupied = await this.usersService.findOne({
      email: createUserInput.email,
    });
    if (emailIsOccupied) {
      throw new EmailOccupiedException();
    }
    const hashedPassword = await PasswordEncoder.hashPassword({
      passwordToHash: createUserInput.password,
    });
    const userInputWithHashedPassword: CreateUserDto = {
      ...createUserInput,
      password: hashedPassword,
    };
    const user = await this.usersService.create(userInputWithHashedPassword);
    const userWithoutHiddenData = pick(user, userMeResponseKeys);

    return userWithoutHiddenData;
  }
}
