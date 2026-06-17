import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { rol?: string } }>();
    const user = request.user;

    if (!user || user.rol !== 'Administrador') {
      throw new ForbiddenException(
        'Acceso restringido únicamente a administradores',
      );
    }

    return true;
  }
}
