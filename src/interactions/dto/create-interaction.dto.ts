import { IsEnum, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateInteractionDto {
  @IsNotEmpty()
  user: Types.ObjectId;

  @IsNotEmpty()
  product: Types.ObjectId;

  @IsEnum(['view', 'like', 'purchase'])
  @IsNotEmpty()
  type: string;
}
