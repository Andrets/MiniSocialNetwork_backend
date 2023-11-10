import { PUBLIC_KEY } from '@app/lib/decorators';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class AuthWsGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | any {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToWs().getData();
    if (!request || !request.headers || !request.headers.authorization) {
      return new WsException('no headers found');
    }

    return super.canActivate(context);
  }
}
