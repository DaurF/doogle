import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Headers,
  NotFoundException,
  Patch,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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
  findAll(
    @Headers('User') username: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string,
    @Query('category') category: string,
    @Query('producer') producer: string,
  ) {
    return this.productsService.findAll(username, {
      page,
      limit,
      search,
      category,
      producer,
    });
  }

  @Get(':productId')
  async getProduct(
    @Param('productId') productId: string,
    @Headers('User') username: string,
  ) {
    return this.productsService.findOne(productId, username);
  }

  @Patch(':id')
  async updateProduct(
    @Param('id') productId: string,
    @Body() updateData: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(productId, updateData);
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
