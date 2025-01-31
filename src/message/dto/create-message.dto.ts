import { IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  readonly sender: string;

  @IsString()
  readonly chat: string;

  @IsString()
  readonly content: string;

  @IsString()
  @IsOptional()
  readonly isAiResponse: boolean;
}
