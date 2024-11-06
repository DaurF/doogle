import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import {
  Interaction,
  InteractionDocument,
} from '../interactions/schemas/interaction.schema';
import { Product } from '../products/schemas/product.schema';

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

  async toggleFavoriteProduct(username: string, product: Product) {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const favoriteIndex = user.favorites.findIndex(
      (fav) => fav._id.toString() === product._id.toString(),
    );

    if (favoriteIndex >= 0) user.favorites.splice(favoriteIndex, 1);
    else user.favorites.push(product);

    await user.save();
    return user;
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
