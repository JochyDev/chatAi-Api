import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { ChatModule } from 'src/chat/chat.module';
import { MessageModule } from 'src/message/message.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ChatModule, MessageModule, JwtModule],
  providers: [AppGateway],
})
export class AppGatewayModule {}
