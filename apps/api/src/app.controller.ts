import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service.js';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ExampleDto } from './dto/example.dto.js';

@ApiTags('Examples')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('validation-check')
  @ApiBody({ type: ExampleDto })
  validationCheck(@Body() dto: ExampleDto) {
    return {
      message: 'Validation successful',
      email: dto.email,
    };
  }
}
