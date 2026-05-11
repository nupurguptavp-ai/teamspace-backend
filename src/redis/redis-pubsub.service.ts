import { Injectable, OnModuleInit } from '@nestjs/common';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

type PubSubPayload = {
  channelId: string;
  message: {
    id: string;
    content: string | null;
    createdAt: Date;
    channelId: string;
    senderId: string;
    sender: {
      id: string;
      email: string;
      name: string | null;
    };
  };
};

@Injectable()
export class RedisPubSubService implements OnModuleInit {
  private pub: Redis;
  private sub: Redis;
  private server: Server;

  constructor(private redisService: RedisService) {}

  // 🔥 connect gateway server
  setServer(server: Server) {
    this.server = server;
  }

  async onModuleInit() {
    // ✅ use existing redis + duplicate
    this.pub = this.redisService.getClient();
    this.sub = this.redisService.getClient().duplicate();

    // ✅ subscribe // This line itself creates the "chat" channel on first run
    await this.sub.subscribe('chat');

    // ✅ listen : 'message' is a built-in event name from Redis
    this.sub.on('message', (channel: string, message: string) => {
      if (!this.server) return;
      console.log('🔥 REDIS MESSAGE RECEIVED');
      const data = JSON.parse(message) as PubSubPayload;

      // 🔥 broadcast to users
      this.server.to(data.channelId).emit('receiveMessage', data.message);
    });
  }

  // ✅ publish
  publish(data: PubSubPayload) {
    console.log('📤 PUBLISHING TO REDIS'); // 👈 ADD
    this.pub.publish('chat', JSON.stringify(data));
  }
}
