import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { ChannelsService } from './channels.service';
import { MessagesService } from 'src/messages/messages.service';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('channels')
export class ChannelsController {
  constructor(
    private channelService: ChannelsService,
    private messagesService: MessagesService,
  ) {}

  @Auth()
  @Post()
  createChannel(@Body() dto: CreateChannelDto) {
    return this.channelService.createChannel(dto.name, dto.workspaceId);
  }

  @Auth()
  @Get()
  getChannels(@Query('workspaceId') workspaceId: string) {
    return this.channelService.getChannels(workspaceId);
  }
}
