import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ChannelsService {
  constructor(private prisma: PrismaService) {}
  async createChannel(name: string, workspaceId: string) {
    return this.prisma.channel.create({
      data: {
        name,
        workspaceId,
      },
    });
  }

  async getChannels(workspaceId: string) {
    //Find all channels WHERE workspaceId matches
    return this.prisma.channel.findMany({
      where: {
        workspaceId,
      },
    });
  }
}
