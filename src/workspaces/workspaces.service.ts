import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}
  async createWorkspace(name: string, userId: string) {
    // prisma.workspace.create() → database mein naya workspace insert karta hai
    return this.prisma.workspace.create({
      data: {
        // workspace ka naam store karo
        name,

        // workspace ke saath ek member bhi create karo (nested create)
        members: {
          // 'create' matlab → member table mein bhi ek row insert karo
          create: {
            // kaun sa user is workspace ka member banega
            userId,

            // jo user workspace banata hai woh automatically ADMIN banta hai
            role: 'ADMIN',
          },
        },
      },
    });
  }

  async getUserWorkspaces(userId: string) {
    // Find workspaces
    // WHERE workspaceMember.userId = current user
    return this.prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
    });
  }

  async inviteUser(workspaceId: string, email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const existingMember = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: user.id,
      },
    });

    if (existingMember) {
      throw new Error('User already in workspace');
    }

    return this.prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: user.id,
        role: 'MEMBER',
      },
    });
  }
}
