import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class PersonalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { rol?: string } }>();
    const user = request.user;

    if (!user || (user.rol !== 'Administrador' && user.rol !== 'Vendedor')) {
      throw new ForbiddenException(
        'Acceso restringido únicamente a personal de la tienda (Vendedor o Administrador)',
      );
    }

    return true;
  }
}
