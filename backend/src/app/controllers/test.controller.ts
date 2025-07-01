import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get('401')
  async test401() {
    throw new HttpException(
      {
        message: 'Unauthorized - Test 401 Error',
        statusCode: HttpStatus.UNAUTHORIZED,
      },
      HttpStatus.UNAUTHORIZED
    );
  }
} 