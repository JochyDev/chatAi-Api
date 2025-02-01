import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';

import { MongooseModule } from '@nestjs/mongoose';
import { AppGatewayModule } from './gateway/app.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GeminiModule } from './gemini/gemini.module';
// T2UorDxfkGnSvJkl
@Module({
  imports: [
    AuthModule,
    ChatModule,
    MessageModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    AppGatewayModule,
    GeminiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
