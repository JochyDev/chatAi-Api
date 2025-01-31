import {
  GoogleGenerativeAI,
  GenerativeModel,
  ChatSession,
} from '@google/generative-ai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetAIMessageDTO } from './dto/get-ai-response.dto';

const GEMINI_MODEL = 'gemini-2.0-flash-exp';
const PROMPT =
  'Tranforma la siguiente respuesta de una api en formato JSON, en un mensaje simple para ser enviado a traves de un chat grupal. Resumen los datos mas importantes. El mensaje debe ser claro y facil de entender por el usuario. Y no debe tener mas de 300 caracteres.';

@Injectable()
export class GeminiService {
  private readonly googleAI: GoogleGenerativeAI;
  private readonly model: GenerativeModel;
  private chatSessions: { [sesionId: string]: ChatSession } = {};
  private readonly logger = new Logger();

  constructor(private configService: ConfigService) {
    const geminiApiKey = this.configService.get('GEMINI_API_KEY');
    this.googleAI = new GoogleGenerativeAI(geminiApiKey);
    this.model = this.googleAI.getGenerativeModel({
      model: GEMINI_MODEL,
    });
  }

  getChatSession(sessionId: string) {
    let result = this.chatSessions[sessionId];

    if (!result) {
      result = this.model.startChat();
      this.chatSessions[sessionId] = result;
    }

    return {
      sessionId: sessionId,
      chat: result,
    };
  }

  async transformJsonToMessage(chatId: string, response: object) {
    try {
      const { sessionId, chat } = this.getChatSession(chatId);

      const result = await chat.sendMessage(PROMPT + JSON.stringify(response));

      return {
        result: result.response.text(),
        sessionId,
      };
    } catch (error) {
      this.logger.error('Error sending message to GEMINI APi >>', error);
    }
  }
}
