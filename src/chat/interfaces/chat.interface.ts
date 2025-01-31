import { Document, Types } from 'mongoose';

export interface Chat extends Document {
  readonly name: string;
  readonly members: string[];
  readonly messages: Types.ObjectId[];
}