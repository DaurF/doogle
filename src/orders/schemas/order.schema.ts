import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  customer_id: Types.ObjectId;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  delivery_time: Date;

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ type: Map, of: Boolean, default: {} })
  confirmed: Map<string, boolean>;

  @Prop({
    type: [
      {
        product: { type: Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
    required: true,
  })
  products: {
    product: Types.ObjectId;
    quantity: number;
  }[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
export type OrderDocument = HydratedDocument<Order>;
