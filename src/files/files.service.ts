import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async saveFile(
    file: Express.Multer.File,
    body: { messageId?: string; uploaderId: string },
  ) {
    const url = `/uploads/${file.filename}`;

    return this.prisma.file.create({
      data: {
        filename: file.filename, // ✅ changed
        url,
        uploaderId: body.uploaderId,
        messageId: body.messageId,
      },
    });
  }
}
