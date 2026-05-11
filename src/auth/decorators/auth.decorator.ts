import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { WsJwtGuard } from 'src/auth/guards/jwt-auth/ws-jwt.guard';

type AuthType = 'http' | 'ws';

export function Auth(type: AuthType = 'http') {
  if (type === 'ws') {
    return applyDecorators(UseGuards(WsJwtGuard), ApiBearerAuth());
  }

  return applyDecorators(UseGuards(JwtAuthGuard), ApiBearerAuth());
}
