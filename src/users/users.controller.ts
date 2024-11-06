import {
  Body,
  Controller,
  Get,
  Headers,
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

  @Patch(':productId')
  favorite(@Headers('User') username: string, @Body() product: Product) {
    return this.usersService.toggleFavoriteProduct(username, product);
  }

  @Get('purchase-history')
  async getPurchaseHistory(
    @Headers('User') username: string, // Get username from headers
  ) {
    if (!username) {
      throw new NotFoundException('Username header is required');
    }

    return await this.usersService.getPurchaseHistory(username);
  }
}
