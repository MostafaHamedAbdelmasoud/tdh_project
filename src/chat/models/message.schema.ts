import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Message document schema for chat messages and DMs.
 */
@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ required: true })
  roomId: string;

  @Prop({ required: true })
  senderId: string;

  @Prop()
  receiverId?: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message); 