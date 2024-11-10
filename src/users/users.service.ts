import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import {
  Interaction,
  InteractionDocument,
} from '../interactions/schemas/interaction.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Interaction.name)
    private readonly interactionModel: Model<InteractionDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async addToFavorites(username: string, productId: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const productObjectId = new Types.ObjectId(productId);

    if (!user.favorites.includes(productObjectId)) {
      user.favorites.push(productObjectId);
      await user.save();
    }

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

  async findByUsername(username: string) {
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new NotFoundException(`User with username "${username}" not found`);
    }
    return user;
  }

  async addToCart(username: string, productId: string): Promise<User> {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const isAlreadyInCart = user.cart.some(
      (cartItem) => cartItem.product.toString() === productId,
    );

    if (!isAlreadyInCart) {
      user.cart.push({ product: new Types.ObjectId(productId), quantity: 1 });
      await user.save();
    }

    return user;
  }

  async removeFromCart(username: string, productId: string): Promise<User> {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const productIndex = user.cart.findIndex(
      (cartItem) => cartItem.product.toString() === productId,
    );

    if (productIndex >= 0) {
      user.cart.splice(productIndex, 1);
      await user.save();
    }

    return user;
  }

  async getCart(username: string) {
    const user = await this.userModel.findOne({ username }).populate({
      path: 'cart.product',
      model: 'Product',
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const cartItems = user.cart.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    }));

    return cartItems;
  }

  async updateCartQuantity(
    username: string,
    productId: string,
    quantity: number,
  ) {
    if (quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const productObjectId = new Types.ObjectId(productId);
    const cartItemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (quantity === 0) {
      if (cartItemIndex > -1) {
        user.cart.splice(cartItemIndex, 1);
      }
    } else {
      if (cartItemIndex > -1) {
        user.cart[cartItemIndex].quantity = quantity;
      } else {
        user.cart.push({ product: productObjectId, quantity });
      }
    }

    await user.save();
    return user.cart;
  }

  async removeFromFavorites(username: string, productId: string) {
    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.favorites = user.favorites.filter(
      (favId) => favId.toString() !== productId,
    );

    await user.save();
    return { message: 'Product removed from favorites successfully' };
  }

  async getFavoriteProducts(username: string) {
    const user = await this.userModel
      .findOne({ username })
      .populate('favorites');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.favorites;
  }

  async clearCart(username: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.cart = [];
    await user.save();

    return user;
  }
}
