import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Producer {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop()
  website?: string;

  @Prop()
  description?: string;
}

export type ProducerDocument = HydratedDocument<Producer>;
export const ProducerSchema = SchemaFactory.createForClass(Producer);
