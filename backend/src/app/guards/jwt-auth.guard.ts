import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Employee } from '../entities/Employee.entity';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = Employee>(
    err: Error | null,
    user: TUser | null,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('No estás autorizado');
    }
    return user;
  }
}
