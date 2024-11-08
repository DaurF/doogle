import {
  Controller,
  Headers,
  Post,
  Body,
  NotFoundException,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

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
}
