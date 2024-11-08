import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Order, OrderDocument } from './schemas/order.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly usersService: UsersService,
  ) {}

  async createOrder(username: string, orderData: CreateOrderDto) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const confirmedStatus: Map<string, boolean> = new Map();

    for (const item of orderData.products) {
      const product = await this.productModel.findById(item.product);
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.product} not found`,
        );
      }

      if (product.stock < item.quantity) {
        throw new HttpException(
          `Not enough stock for product ${product.name}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      product.stock -= item.quantity;
      await product.save();

      const supplierId = product.userId.toString();

      if (!confirmedStatus.has(supplierId)) {
        confirmedStatus.set(supplierId, false);
      }
    }

    const order = new this.orderModel({
      ...orderData,
      customer_id: user._id,
      confirmed: confirmedStatus,
    });

    return await order.save();
  }

  async getOrders(username: string): Promise<Order[]> {
    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.orderModel
      .find({ customer_id: user._id })
      .populate('products.product')
      .exec();
  }
}
