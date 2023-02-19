import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { PublicRoute } from '../auth/decorators/public-route';
import { ApiTags } from '@nestjs/swagger';

@Controller('/')
@ApiTags('main')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @PublicRoute()
  @Get()
  getData() {
    return this.appService.getData();
  }
}
