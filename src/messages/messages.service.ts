import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

type CachedMessage = {
  id: string;
  content: string | null;
  createdAt: Date;
  channelId: string;
  senderId: string;
  sender?: {
    id: string;
    email: string;
    name: string | null;
  };
};

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async createMessage(userId: string, channelId: string, content: string) {
    const message = await this.prisma.message.create({
      data: {
        senderId: userId,
        channelId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    const key = `channel:${channelId}:messages`;

    // ✅ correct typing
    const existing = (await this.redis.get<(typeof message)[]>(key)) || [];

    // ✅ latest first
    const updated = [message, ...existing].slice(0, 20);

    // ✅ optional expiry (recommended)
    await this.redis.set(key, updated);
    await this.redis.getClient().expire(key, 86400);

    return message;
  }

  async getMessages(channelId: string) {
    const key = `channel:${channelId}:messages`;

    const cached = await this.redis.get<CachedMessage[]>(key);

    if (cached) {
      console.log('⚡ FROM REDIS');
      return cached;
    }

    console.log('🐢 FROM DB');

    const messages = await this.prisma.message.findMany({
      where: { channelId },
      orderBy: { createdAt: 'desc' }, // ✅ important
      take: 20,
      include: {
        sender: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    await this.redis.set(key, messages);

    return messages;
  }
}
