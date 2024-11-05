import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import {
  Interaction,
  InteractionDocument,
} from '../interactions/schemas/interaction.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Interaction.name)
    private readonly interactionModel: Model<InteractionDocument>,
  ) {}

  create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async favorite(username: string, productId: string) {
    const productObjectId = new Types.ObjectId(productId);

    const user = await this.userModel.findOne({ username: username });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingInteraction = await this.interactionModel.findOne({
      user: user._id,
      product: productObjectId,
      type: 'like',
    });

    if (existingInteraction) {
      user.favorites = user.favorites.filter(
        (fav) => !fav.equals(productObjectId),
      );

      await this.interactionModel.deleteOne({
        user: user._id,
        product: productObjectId,
        type: 'like',
      });
    } else {
      user.favorites.push(productObjectId);

      await this.interactionModel.create({
        user: user._id,
        product: productObjectId,
        type: 'like',
        timestamp: new Date(),
      });
    }

    await user.save();
  }

  async addProductToPurchaseHistory(
    username: string,
    productId: string,
  ): Promise<User | null> {
    const productObjectId = new Types.ObjectId(productId);

    const user = await this.userModel.findOneAndUpdate(
      { username: username },
      { $addToSet: { purchaseHistory: productObjectId } },
      { new: true },
    );

    return user;
  }

  findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async getPurchaseHistory(username: string) {
    // Find the user by username
    const user = await this.userModel
      .findOne({ username })
      .populate('purchaseHistory');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.purchaseHistory; // This will return the populated products
  }
}
