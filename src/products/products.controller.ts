import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Headers,
  NotFoundException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('recommendations')
  async getRecommendations(@Headers('User') username: string) {
    if (!username) {
      throw new NotFoundException('Username header is required');
    }

    return this.productsService.getRecommendationsForUser(username);
  }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Headers('User') username: string) {
    return this.productsService.findAll(username);
  }

  @Get(':productId')
  async getProduct(
    @Param('productId') productId: string,
    @Headers('User') username: string,
  ) {
    return this.productsService.findOne(productId, username);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post(':productId/buy')
  async buyProduct(
    @Param('productId') productId: string,
    @Headers('User') username: string, // Get username from headers
  ) {
    if (!username) {
      throw new NotFoundException('Username header is required');
    }

    const result = await this.productsService.buyProduct(username, productId);

    if (!result) {
      throw new NotFoundException(
        'User or Product not found or already purchased',
      );
    }

    return { message: 'Product purchased successfully', productId };
  }
}
