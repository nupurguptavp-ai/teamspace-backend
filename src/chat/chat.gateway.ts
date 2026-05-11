import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { SendMessageDto } from '../messages/dto/send-message.dto';
import { MessagesService } from 'src/messages/messages.service';
import { RedisPubSubService } from 'src/redis/redis-pubsub.service';
import { Auth } from 'src/auth/decorators/auth.decorator';

interface AuthSocket extends Socket {
  data: {
    user?: {
      sub: string;
    };
  };
}
/*
  @WebSocketGateway
  -----------------
  Marks this class as a WebSocket server.

  cors: true
  Allows clients from any origin to connect to the socket server.
*/
@Auth('ws')
@WebSocketGateway({
  cors: true,
})
export class ChatGateway {
  constructor(
    private messagesService: MessagesService,
    private redisPubSub: RedisPubSubService,
  ) {}

  /*
    @WebSocketServer
    ----------------
    Injects the main Socket.IO server instance.

    This allows us to emit events to clients:
    - broadcast to all clients
    - broadcast to rooms
    - send events to specific sockets
  */
  @WebSocketServer()
  server: Server;

  afterInit() {
    // 🔥 connect server to pubsub
    this.redisPubSub.setServer(this.server);
  }

  handleConnection(client: AuthSocket): void {
    // guard yahan nahi chalta, isliye undefined aata hai
    // bas log karo — disconnect mat karo
    console.log('🔥 client connected:', client.id);
  }

  /*
    @SubscribeMessage('sendMessage')
    --------------------------------
    Listens for the "sendMessage" event from clients.

    When a client emits:
      socket.emit('sendMessage', data)

    This function will execute.
  */
  @SubscribeMessage('sendMessage')
  async handleMessage(
    /*
      @MessageBody
      ------------
      Extracts the data sent by the client.
      Example payload:

      {
        channelId: "123",
        content: "Hello"
      }
    */
    @MessageBody() data: SendMessageDto,

    /*
      @ConnectedSocket
      ----------------
      Gives access to the specific socket connection
      that sent the event.
    */
    @ConnectedSocket() client: AuthSocket,
  ) {
    /*
      client.data.user
      ----------------
      This is where authenticated user data should be stored
      during WebSocket connection after verifying JWT.

      Example structure:
      client.data.user = {
        sub: userId
      }
    */
    // guard yahan chalta hai ✅
    console.log('🔥 user:', client.data.user);
    const userId = client.data.user?.sub;

    if (!userId) throw new Error('Unauthorized');

    /*
      Save message in database using MessagesService
    */
    const savedMessage = await this.messagesService.createMessage(
      userId,
      data.channelId,
      data.content,
    );

    /*
      server.to(room).emit()
      ----------------------

      Broadcast message only to users in the channel room.

      This ensures:
      - only users in the channel receive the message
      - other channels do not receive it
    */
    // this.server.to(data.channelId).emit('receiveMessage', savedMessage);
    // 🔥 PUBLISH to Redis
    this.redisPubSub.publish({
      channelId: data.channelId,
      message: savedMessage,
    });
  }

  /*
    @SubscribeMessage('joinChannel')
    --------------------------------
    Triggered when a client joins a channel.

    Example client event:
      socket.emit('joinChannel', { channelId })
  */
  @SubscribeMessage('joinChannel')
  handleJoinChannel(
    /*
      Client sends which channel they want to join
    */
    @MessageBody() data: { channelId: string },

    /*
      The specific connected socket
    */
    @ConnectedSocket() client: Socket,
  ) {
    /*
      client.join(room)
      -----------------

      Adds this socket to a room.

      Room name = channelId

      Later when we emit to this room:
      server.to(channelId).emit()

      Only clients in that room will receive messages.
    */
    client.join(data.channelId);
  }
}
