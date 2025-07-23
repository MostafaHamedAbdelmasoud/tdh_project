import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Room document schema for chat rooms.
 */
@Schema({ timestamps: true })
export class Room extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const RoomSchema = SchemaFactory.createForClass(Room); 