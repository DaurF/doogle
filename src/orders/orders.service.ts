import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Order, OrderDocument } from './schemas/order.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
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

  async findOrdersBySupplier(supplierId: string) {
    console.log('orders');

    const orders = await this.orderModel
      .find({
        [`confirmed.${supplierId}`]: { $exists: true },
      })
      .populate('products.product')
      .exec();

    return orders;
  }

  async confirmOrder(orderId: string, supplierId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    order.confirmed.set(supplierId, true);
    order.markModified('confirmed');

    await order.save();

    return order;
  }

  async getSupplierStatistics(
    supplierId: Types.ObjectId,
  ): Promise<{ orderCount: number; totalRevenue: number }> {
    const orders = await this.orderModel.aggregate([
      {
        $match: {
          confirmed: {
            [supplierId.toString()]: true,
          },
        },
      },
      {
        $unwind: '$products',
      },
      {
        $lookup: {
          from: 'products',
          localField: 'products.product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $unwind: '$productDetails',
      },
      {
        $group: {
          _id: null,
          orderCount: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $multiply: ['$products.quantity', '$productDetails.price'],
            },
          },
        },
      },
    ]);

    if (orders.length === 0) {
      return { orderCount: 0, totalRevenue: 0 };
    }

    return {
      orderCount: orders[0].orderCount,
      totalRevenue: orders[0].totalRevenue,
    };
  }
}
