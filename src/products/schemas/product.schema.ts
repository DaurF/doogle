import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Category } from '../../categories/schemas/category.schema';
import { Producer } from '../../producers/schemas/producer.schema';

@Schema()
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Producer' })
  producer: Producer | string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
  })
  category?: Category;

  @Prop({ required: true })
  price: number;

  @Prop({ type: [String] })
  images: string[];

  @Prop()
  stock?: number;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

export type ProductDocument = HydratedDocument<Product>;
