import { Injectable, OnModuleInit } from '@nestjs/common';
// Import PrismaClient which is the auto-generated database client
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
// PrismaService extends PrismaClient so we can use all Prisma DB methods
// It also implements OnModuleInit so we can run code when the module starts
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
      }),
    });
  }
  // This lifecycle method runs automatically when the NestJS module initializes
  async onModuleInit() {
    await this.$connect();
  }
}
