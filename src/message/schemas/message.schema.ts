import { Schema, Types } from 'mongoose';

export const MessageSchema = new Schema(
  {
    sender: {
      type: Types.ObjectId,
      ref: 'User',
    },
    chat: {
      type: Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isAiResponse: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
