import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from '../../services/auth.service';
import { AuthController } from '../../controllers/auth.controller';
import { EmployeeModule } from '../employee.module';
import { StorageModule } from '../storage.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
    }),
    EmployeeModule,
    StorageModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, AuthService],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
