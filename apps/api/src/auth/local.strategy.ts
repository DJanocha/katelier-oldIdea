import { Injectable, Req, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }
  /**
   *
   * looks like the validate function cannot be async (must return 'any', not Promise<any>)
   * Or maybe not. Not sure why it now starrtted to inject stuff to req.user :thinking_emoji:
   * but I'll  investigate it further like in here:
   * https://github.com/nestjs/docs.nestjs.com/issues/875
   * https://github.com/nestjs/nest/issues/3631
   * or maybe something deeper is wrong like authService/validateuser/{const user = awai this.usersService.findOne({email});}
   */
  // validate(username: string, password: string): any {
  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
