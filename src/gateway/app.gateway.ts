import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Socket, Server } from 'socket.io';
import { ChatService } from 'src/chat/chat.service';
import { CreateChatDto } from 'src/chat/dto/create-chat.dto';
import { CreateMessageDto } from 'src/message/dto/create-message.dto';
import { MessageService } from 'src/message/message.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class AppGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private messageService: MessageService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    try {
      await this.jwtService.verify(token);
    } catch (error) {
      client.disconnect();
      return;
    }
  }

  @SubscribeMessage('create-chat')
  async handleCreateChat(@MessageBody() body: CreateChatDto) {
    const chat = await this.chatService.create(body);
    this.emitSocketEvent('on-create-chat', chat);
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() data: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const message = await this.messageService.create(data);
      this.emitSocketEvent('on-message', message);
    } catch (error) {
      this.emitOnError(client, error);
    }
  }

  @SubscribeMessage('on-query')
  async handleQuery(
    @MessageBody() data: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { chat, content } = data;
      const message = await this.messageService.processQuery(chat, content);
      this.emitSocketEvent('on-message', message);
    } catch (error) {
      this.emitOnError(client, error);
    }
  }

  emitSocketEvent(eventName, chat) {
    this.server.emit(eventName, chat);
  }

  emitOnError(client: Socket, message) {
    client.emit('on-error', message);
  }
}
