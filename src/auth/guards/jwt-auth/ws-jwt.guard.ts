/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

type JwtPayload = {
  sub: string;
};

// ✅ Fully typed socket
interface AuthSocket extends Socket {
  data: {
    user?: JwtPayload;
  };
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    // STEP 1: Client connect only once
    const client = context.switchToWs().getClient<AuthSocket>();

    const authHeader = client.handshake.headers?.authorization;

    let token: string | undefined;

    // ✅ from socket auth
    if (client.handshake.auth?.token) {
      token = client.handshake.auth.token;
    }

    // ✅ from Bearer header
    else if (
      typeof authHeader === 'string' &&
      authHeader.startsWith('Bearer ')
    ) {
      const parts = authHeader.split(' ');
      token = parts.length > 1 ? parts[1] : undefined;
    }

    if (!token) return false;

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);

      // ✅ attach user
      client.data.user = payload;

      return true;
    } catch {
      return false;
    }
  }
}
