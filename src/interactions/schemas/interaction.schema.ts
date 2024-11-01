import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Product } from '../../products/schemas/product.schema';

@Schema()
export class Interaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Product;

  @Prop({ required: true, enum: ['view', 'like', 'purchase'] })
  type: string;

  @Prop({ required: true, default: Date.now })
  timestamp: Date;
}

export type InteractionDocument = HydratedDocument<Interaction>;
export const InteractionSchema = SchemaFactory.createForClass(Interaction);
