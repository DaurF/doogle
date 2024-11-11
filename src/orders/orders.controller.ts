import {
  Controller,
  Headers,
  Post,
  Body,
  NotFoundException,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UsersService } from '../users/users.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
  ) {}

  @Get('supplier')
  async getOrdersBySupplier(@Headers('User') username: string) {
    if (!username) {
      throw new NotFoundException('Username not provided in headers');
    }

    try {
      const supplier = await this.usersService.findByUsername(username);
      console.log(supplier._id);
      if (!supplier) {
        throw new NotFoundException(
          `Supplier with username ${username} not found`,
        );
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return await this.ordersService.findOrdersBySupplier(supplier._id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Post()
  async addOrder(
    @Headers('User') username: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    if (!username) {
      throw new NotFoundException('Username not provided in headers');
    }

    return this.ordersService.createOrder(username, createOrderDto);
  }

  @Get()
  async getOrders(@Headers('User') username: string) {
    try {
      return await this.ordersService.getOrders(username);
    } catch (error) {
      throw new HttpException(
        error.message || 'Could not retrieve orders',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('confirm')
  async confirmOrderBySupplier(
    @Headers('User') username: string,
    @Body('id') id: string,
  ) {
    if (!username) {
      throw new NotFoundException('Username not provided in headers');
    }

    try {
      const supplier = await this.usersService.findByUsername(username);
      if (!supplier) {
        throw new NotFoundException(
          `Supplier with username ${username} not found`,
        );
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return await this.ordersService.confirmOrder(id, supplier._id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Could not confirm the order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('supplier-statistics')
  async getSupplierStatistics(@Headers('User') username: string) {
    if (!username) {
      throw new NotFoundException('Username not provided in headers');
    }

    // Fetch supplier details using the username from headers
    const supplier = await this.usersService.findByUsername(username);
    if (!supplier || supplier.role !== 'supplier') {
      throw new NotFoundException('Supplier not found');
    }

    const supplierId = supplier._id; // Get the supplierId (ObjectId)

    // Pass the supplierId to the service function
    const statistics =
      await this.ordersService.getSupplierStatistics(supplierId);

    return statistics;
  }
}
