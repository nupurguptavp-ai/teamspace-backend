import { Controller, Get, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Auth()
  @Get('channel/:channelId')
  getMessages(@Param('channelId') channelId: string) {
    return this.messagesService.getMessages(channelId);
  }
}
