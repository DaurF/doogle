import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema()
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, minlength: 5, maxlength: 100 })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, minlength: 5, maxlength: 100 })
  password: string;

  @Prop({
    enum: ['customer', 'supplier', 'moder', 'admin'],
    default: 'customer',
  })
  role: string;

  @Prop({ type: [Types.ObjectId], ref: 'Product', default: [] })
  favorites: Types.ObjectId[];

  @Prop({
    type: {
      age: { type: Number },
      location: { type: String },
      interests: { type: [String] },
      pictureUrl: { type: String },
    },
    default: {
      interests: [],
    },
  })
  profile: {
    age?: number;
    location?: string;
    interests: string[];
    pictureUrl?: string;
  };

  @Prop({
    type: [
      {
        product: { type: Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 1 },
      },
    ],
    default: [],
  })
  cart: { product: Types.ObjectId; quantity: number }[];
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = HydratedDocument<User>;
