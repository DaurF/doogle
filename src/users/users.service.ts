import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }
}
