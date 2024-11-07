import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestsService } from './requests.service';
import { UsersService } from '../users/users.service';
import { CreateProductDto } from '../products/dto/create-product.dto';

@Controller('requests')
export class RequestsController {
  constructor(
    private readonly requestsService: RequestsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async create(
    @Headers('User') username: string,
    @Body() createRequestDto: CreateRequestDto,
  ) {
    const { type, body } = createRequestDto;
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.requestsService.create(type, body, user._id);
  }

  @Get()
  findAll(@Headers('User') username: string) {
    return this.requestsService.getRequestsByUsername(username);
  }

  @Get('all')
  findAllRequests() {
    return this.requestsService.findAll();
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectRequest(@Param('id') id: string) {
    return await this.requestsService.rejectRequest(id);
  }

  @Patch(':id/approve')
  async approveRequest(
    @Param('id') id: string,
    @Body('data')
    createProductDto: CreateProductDto & { userId: string; type: string },
  ) {
    return await this.requestsService.approveRequest(id, createProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requestsService.removeRequestById(id);
  }
}
