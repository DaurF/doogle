import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: {
      age: { type: Number },
      location: { type: String },
      interests: { type: [String] },
    },
    default: {},
  })
  profile: {
    age?: number;
    location?: string;
    interests?: string[];
  };

  @Prop({ type: [Types.ObjectId], ref: 'Order', default: [] })
  purchaseHistory: Types.ObjectId[];

  @Prop({
    type: {
      viewedProducts: { type: [Types.ObjectId], ref: 'Product', default: [] },
      likedProducts: { type: [Types.ObjectId], ref: 'Product', default: [] },
    },
    default: {},
  })
  interactions: {
    viewedProducts: Types.ObjectId[];
    likedProducts: Types.ObjectId[];
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = HydratedDocument<User>;
