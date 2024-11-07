import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

export type RequestDocument = HydratedDocument<Request>;

export enum RequestType {
  CREATE_PRODUCT = 'create-product',
  UPDATE_PRODUCT = 'update-product',
  CREATE_CATEGORY = 'create-category',
  UPDATE_CATEGORY = 'update-category',
  CREATE_PRODUCER = 'create-producer',
  UPDATE_PRODUCER = 'update-producer',
}

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class Request {
  @Prop({ required: true, enum: RequestType })
  type: RequestType;

  @Prop({ type: Object, required: true })
  body: Record<string, any>;

  @Prop({ default: RequestStatus.PENDING, enum: RequestStatus })
  status: RequestStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  submittedBy: Types.ObjectId;
}

export const RequestSchema = SchemaFactory.createForClass(Request);
