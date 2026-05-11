import { IsString, IsUUID, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  channelId: string;

  @IsString()
  @MaxLength(2000)
  content: string;
}
