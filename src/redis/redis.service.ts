import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  // private client = new Redis(); bad approach creates multiple client
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST!,
      port: parseInt(process.env.REDIS_PORT!),
    });
  }

  getClient() {
    return this.client;
  }
  // data save
  async set(key: string, value: unknown): Promise<void> {
    //object/array ko string mein convert karo
    await this.client.set(key, JSON.stringify(value));
  }
  //get data
  async get<T>(key: string): Promise<T | null> {
    //wapas object/array mein convert karo
    const data = await this.client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }
}
