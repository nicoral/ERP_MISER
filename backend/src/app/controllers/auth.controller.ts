import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthLoginDto } from '../dto/auth/auth-login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuditDescription } from '../common/decorators/audit-description.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me-permissions')
  @UseGuards(JwtAuthGuard)
  @AuditDescription('Consulta de permisos del usuario actual')
  async mePermissions(@Req() req) {
    return await this.authService.getEmployeeWithPermissions(req.user.id);
  }

  @Post('login')
  @AuditDescription('Inicio de sesión de usuario')
  async login(@Body() loginDto: AuthLoginDto) {
    const employee = await this.authService.validateUser(
      loginDto.email,
      loginDto.password
    );
    return this.authService.login(employee);
  }
}
