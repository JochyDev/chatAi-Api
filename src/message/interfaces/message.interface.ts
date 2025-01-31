import { Document } from 'mongoose';

export interface Message extends Document {
  readonly sender: string;
  readonly chat: string;
  readonly content: string;
  readonly isAiResponse: boolean;
  readonly timestamp: Date;
}
