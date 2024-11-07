import { IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { RequestType } from '../schemas/request.schema';

export class CreateRequestDto {
  @IsEnum(RequestType)
  @IsNotEmpty()
  type: RequestType;

  @IsObject()
  @IsNotEmpty()
  body: Record<string, any>;
}
