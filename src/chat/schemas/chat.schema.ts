import { Schema, Types } from 'mongoose';

export const ChatSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    members: [
      {
        type: Types.ObjectId,
        ref: 'User',
        default: [],
      },
    ],
    messages: [
      {
        type: Types.ObjectId,
        ref: 'Message',
        default: [],
      },
    ],
  },
  { timestamps: true },
);
