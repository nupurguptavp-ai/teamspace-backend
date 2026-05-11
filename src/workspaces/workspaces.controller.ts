import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { WorkspacesService } from './workspaces.service';
import { CurrentUser } from 'src/auth/decorators/current-user/current-user.decorator';
import { InviteUserDto } from './dto/invite-user.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private workspaceService: WorkspacesService) {}

  @Auth()
  @Post()
  createWorkspace(
    @Body() dto: CreateWorkspaceDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.workspaceService.createWorkspace(dto.name, user.userId);
  }

  @Auth()
  @Get()
  getWorkspaces(@CurrentUser() user: { userId: string }) {
    return this.workspaceService.getUserWorkspaces(user.userId);
  }

  @Auth()
  @Post(':workspaceId/invite')
  inviteUser(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: InviteUserDto,
  ) {
    return this.workspaceService.inviteUser(workspaceId, dto.email);
  }
}
