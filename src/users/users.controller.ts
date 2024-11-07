import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Product } from '../products/schemas/product.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // @Patch(':productId')
  // favorite(@Headers('User') username: string, @Body() product: Product) {
  //   return this.usersService.toggleFavoriteProduct(username, product);
  // }

  @Post('cart/:productId')
  async addToCart(
    @Headers('User') username: string,
    @Param('productId') productId: string,
  ) {
    try {
      return await this.usersService.addToCart(username, productId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Delete('cart/:productId')
  async removeFromCart(
    @Headers('User') username: string,
    @Param('productId') productId: string,
  ) {
    try {
      return await this.usersService.removeFromCart(username, productId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get('cart')
  async getCart(@Headers('User') username: string) {
    try {
      return await this.usersService.getCart(username);
    } catch (error) {
      throw new HttpException(
        error.message || 'Could not retrieve cart items',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('cart')
  async updateCartQuantity(
    @Headers('User') username: string,
    @Body('productId') productId: string,
    @Body('quantity') quantity: number,
  ) {
    try {
      return await this.usersService.updateCartQuantity(
        username,
        productId,
        quantity,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Could not update cart quantity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
