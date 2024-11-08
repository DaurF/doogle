import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './schemas/product.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import {
  Interaction,
  InteractionDocument,
} from '../interactions/schemas/interaction.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Interaction.name)
    private readonly interactionModel: Model<InteractionDocument>,
    private readonly usersService: UsersService,
  ) {}

  create(createProductDto: CreateProductDto) {
    try {
      const newProduct = new this.productModel(createProductDto);
      return newProduct.save();
    } catch (err) {
      throw new Error('Something wrong');
    }
  }

  async updateProduct(productId: string, updateData: Partial<Product>) {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(
        productId,
        { $set: updateData },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return updatedProduct;
  }

  async findAll(
    username: string,
    {
      page = 1,
      limit = 10,
      search,
      category,
      producer,
    }: {
      page: number;
      limit: number;
      search?: string;
      category?: string;
      producer?: string;
    },
  ) {
    // Find the user (optional if you want to include user data, otherwise remove this part)
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const query = {};

    if (search) {
      query['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query['category.name'] = category;
    }

    if (producer) {
      query['producer.name'] = producer;
    }

    const total = await this.productModel.countDocuments(query).exec();

    const skip = (page - 1) * limit;

    const products = await this.productModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .populate('category')
      .populate('producer')
      .exec();

    return {
      products,
      total,
    };
  }

  async findOne(productId: string, username: string) {
    const user = await this.userModel.findOne({ username: username });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const favoriteProductIds = user.favorites.map((fav) => fav.toString());

    const cartProductIds = user.cart.map((cartItem) =>
      cartItem.product.toString(),
    );

    const product = await this.productModel
      .findById(productId)
      .populate('producer')
      .populate('category');

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const isFavorite = favoriteProductIds.includes(product._id.toString());

    console.log('isFavorite', isFavorite);
    const isInCart = cartProductIds.includes(product._id.toString());

    const existingView = await this.interactionModel.findOne({
      user: user._id,
      product: product._id,
      type: 'view',
    });

    if (!existingView) {
      await this.interactionModel.create({
        user: user._id,
        product: product._id,
        type: 'view',
        timestamp: new Date(),
      });
    }

    return {
      ...product.toObject(),
      isFavorite,
      isInCart,
    };
  }

  async buyProduct(username: string, productId: string): Promise<boolean> {
    const productObjectId = new Types.ObjectId(productId);

    const product = await this.productModel.findById(productObjectId);
    if (!product) {
      return false;
    }

    const existingInteraction = await this.interactionModel.findOne({
      user: username,
      product: productObjectId,
      type: 'purchase',
    });

    if (existingInteraction) {
      return false;
    }

    const user = await this.usersService.addProductToPurchaseHistory(
      username,
      productId,
    );
    if (!user) {
      return false;
    }

    await this.interactionModel.create({
      user: user._id,
      product: productObjectId,
      type: 'purchase',
      timestamp: new Date(),
    });

    return true;
  }

  async getRecommendationsForUser(username: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const interactions = await this.interactionModel.find();

    const interactedProductIds = interactions.map(
      (interaction) => interaction.product,
    );

    console.log(interactedProductIds);

    const similarUserInteractions = await this.interactionModel
      .find({
        product: { $in: interactedProductIds },
        user: { $ne: user._id },
      })
      .populate('product');

    console.log(similarUserInteractions);

    const productWeightMap = new Map<string, number>();

    for (const interaction of similarUserInteractions) {
      const productId = interaction.product._id.toString();
      let weight = 0;

      // Assign weight based on the type of interaction
      switch (interaction.type) {
        case 'purchase':
          weight = 3;
          break;
        case 'like':
          weight = 2;
          break;
        case 'view':
          weight = 1;
          break;
      }

      if (productWeightMap.has(productId)) {
        productWeightMap.set(
          productId,
          productWeightMap.get(productId)! + weight,
        );
      } else {
        productWeightMap.set(productId, weight);
      }
    }

    const recommendedProductIds = Array.from(productWeightMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map((entry) => entry[0]);

    return await this.productModel.find({
      _id: { $in: recommendedProductIds },
    });
  }

  async remove(id: string) {
    const result = await this.productModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}
