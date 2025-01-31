import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './interfaces/message.interface';
import { Model, Types } from 'mongoose';
import { Chat } from 'src/chat/interfaces/chat.interface';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { GeminiService } from 'src/gemini/gemini.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MessageService {
  private readonly apiRoutes = {
    fakeStore: {
      url: 'https://fakestoreapi.com/products/category/:name',
    },
    rickAndMorty: {
      url: 'https://rickandmortyapi.com/api/character/?name=:name',
    },
    pokemon: {
      url: 'https://pokeapi.co/api/v2/pokemon/:name',
    },
  };

  constructor(
    @InjectModel('Message') readonly messageModel: Model<Message>,
    @InjectModel('Chat') private readonly chatModel: Model<Chat>,
    private readonly httpService: HttpService,
    private readonly geminiService: GeminiService,
  ) {}
  async create(createMessageDto: CreateMessageDto) {
    const message = await this.messageModel.create(createMessageDto);
    const chat = await this.chatModel.findById(createMessageDto.chat);

    if (!chat) {
      throw new NotFoundException('Chat no encontrado');
    }

    chat.messages.push(message._id as Types.ObjectId);
    await chat.save();

    const populatedMessage = await this.messageModel
      .findById(message._id)
      .populate('sender')
      .exec();

    return populatedMessage;
  }

  async processQuery(chatId: string, userQuery: string) {
    if (!userQuery.startsWith('/query ')) {
      throw new BadRequestException(
        'Formato incorrecto. Usa: /query <api> <pregunta>}',
      );
    }

    const consult = userQuery.replace('/query ', '').trim();

    const apiName = consult.split(' ')[0];

    const apiUrl = this.apiRoutes[apiName].url;

    if (!apiUrl) {
      throw new BadRequestException('No se encontró una API para la consulta.');
    }

    const queryText = consult.split(' ')[1];

    const urlToConsult = apiUrl.replace(':name', queryText);

    // Hacer la solicitud a la API correspondiente
    return this.fetchFromApi(chatId, urlToConsult);
  }

  private async fetchFromApi(chatId: string, api: string) {
    try {
      const { data } = await firstValueFrom(this.httpService.get(api));

      const messageAi = await this.geminiService.transformJsonToMessage(
        chatId,
        data,
      );

      const message = await this.create({
        chat: chatId,
        content: messageAi.result,
        isAiResponse: true,
        sender: null,
      });

      return message;
    } catch (error) {
      throw new BadRequestException('Error al obtener los datos de la API');
    }
  }
}
