import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from './interfaces/chat.interface';
import { Model, Types } from 'mongoose';

@Injectable()
export class ChatService {
  constructor(@InjectModel('Chat') readonly chatModel: Model<Chat>) {}

  async create(createChatDto: CreateChatDto) {
    const { name, members } = createChatDto;

    const chat = await this.chatModel.create({
      name,
      members,
    });

    return chat;
  }

  async getUserChats(userId: string) {
    return await this.chatModel
      .find({ members: userId })
      .populate('messages')
      .exec();
  }

  async getChatById(id: string) {
    return await this.chatModel
      .findOne({ _id: new Types.ObjectId(id) })
      .populate({
        path: 'messages',
        populate: {
          path: 'sender',
          model: 'User',
        },
      })
      .populate('members')
      .exec();
  }
}
