import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
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
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify(token);
      console.log('client connected');
      return payload;
    } catch (error) {
      client.disconnect();
      return;
    }
  }

  @SubscribeMessage('create-chat')
  async handleCreateChat(@MessageBody() body: CreateChatDto) {
    const chat = await this.chatService.create(body);
    this.emitOnCreateChat(chat);
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(@MessageBody() data: CreateMessageDto) {
    const message = await this.messageService.create(data);
    this.emitOnMessage(message);
  }

  @SubscribeMessage('on-query')
  async handleQuery(@MessageBody() data: CreateMessageDto) {
    const { chat, content } = data;
    const message = await this.messageService.processQuery(chat, content);
    this.emitOnMessage(message);
  }

  emitOnCreateChat(chat) {
    this.server.emit('on-create-chat', chat);
  }

  emitOnMessage(message) {
    this.server.emit('on-message', message);
  }
}
