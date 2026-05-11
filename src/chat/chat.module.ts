import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MessagesModule } from '../messages/messages.module';
import { RedisModule } from 'src/redis/redis.module';
import { AuthModule } from 'src/auth/auth.module';
import { WsJwtGuard } from 'src/auth/guards/jwt-auth/ws-jwt.guard';

@Module({
  imports: [MessagesModule, RedisModule, AuthModule],
  providers: [ChatGateway, WsJwtGuard],
})
export class ChatModule {}
