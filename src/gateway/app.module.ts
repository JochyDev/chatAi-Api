import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { ChatModule } from 'src/chat/chat.module';
import { MessageModule } from 'src/message/message.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [ChatModule, MessageModule, AuthModule],
  providers: [AppGateway],
})
export class AppGatewayModule {}
