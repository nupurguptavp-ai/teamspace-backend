import { Module } from '@nestjs/common';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { MessagesService } from 'src/messages/messages.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [ChannelsController],
  providers: [ChannelsService, MessagesService],
})
export class ChannelsModule {}
