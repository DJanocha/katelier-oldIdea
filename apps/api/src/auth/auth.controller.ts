import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { LocalAuthGuard } from '../auth/local-auth-guard';
import { AuthService } from '../auth/auth.service';
import { PublicRoute } from '../auth/decorators/public-route';
import {
  ApiBody,
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { MeResponseDto } from '../auth/dto/me-response-dto';
import { LoginDto } from '../auth/dto/login.dto';

import { EmailOccupiedExceptionApiResponseSchema } from '../auth/exceptions/email-occupied-exception';

@Controller('/')
@ApiTags('auths')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @PublicRoute()
  @HttpCode(200)
  @ApiOkResponse({ type: MeResponseDto })
  @ApiBody({ type: LoginDto, required: true })
  @Post('auth/login')
  async login(@Req() req) {
    const { id: userId, email } = req.user;
    return this.authService.login({ userId, email });
  }

  @Get('/me')
  @ApiBearerAuth()
  @ApiOkResponse({ type: MeResponseDto })
  @ApiUnauthorizedResponse({
    schema: {
      example: { message: 'Unauthorized', statusCode: HttpStatus.UNAUTHORIZED },
    },
  })
  getMe(@Req() req) {
    return req.user;
  }

  @PublicRoute()
  @Post('/auth/register')
  @ApiCreatedResponse({ type: MeResponseDto })
  @ApiConflictResponse({ schema: EmailOccupiedExceptionApiResponseSchema })
  @ApiBody({
    required: true,
    type: CreateUserDto,
  })
  async register(@Req() req, @Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
}
