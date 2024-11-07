import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Request,
  RequestDocument,
  RequestType,
} from './schemas/request.schema';
import { UsersService } from '../users/users.service';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import {
  Category,
  CategoryDocument,
} from '../categories/schemas/category.schema';
import {
  Producer,
  ProducerDocument,
} from '../producers/schemas/producer.schema';
import { CreateProductDto } from '../products/dto/create-product.dto';

@Injectable()
export class RequestsService {
  constructor(
    private readonly usersService: UsersService,
    @InjectModel(Request.name) private requestModel: Model<RequestDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Producer.name) private producerModel: Model<ProducerDocument>,
  ) {}

  async create(
    type: RequestType,
    body: Record<string, any>,
    userId: Types.ObjectId,
  ): Promise<Request> {
    const newRequest = new this.requestModel({
      type,
      body,
      submittedBy: userId,
    });
    return newRequest.save();
  }

  findAll() {
    return this.requestModel.find().exec();
  }

  async getRequestsByUsername(username: string): Promise<Request[]> {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new NotFoundException(`User with username "${username}" not found`);
    }

    return await this.requestModel.find({ submittedBy: user._id }).exec();
  }

  async removeRequestById(requestId: string) {
    const requestObjectId = new Types.ObjectId(requestId);

    const result = await this.requestModel.findByIdAndDelete(requestObjectId);
    if (!result) {
      throw new NotFoundException(`Request with ID "${requestId}" not found`);
    }

    return { message: `Request with ID "${requestId}" has been removed` };
  }

  async rejectRequest(requestId: string) {
    const request = await this.requestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException(`Request with ID "${requestId}" not found`);
    }

    await this.requestModel.findByIdAndUpdate(requestId, {
      status: 'rejected',
    });
    return { message: `Request with ID "${requestId}" has been rejected` };
  }

  async approveRequest(
    requestId: string,
    createProductDto: CreateProductDto & { userId: string; type: string },
  ) {
    const request = await this.requestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException(`Request with ID "${requestId}" not found`);
    }

    const { type, userId, ...data } = createProductDto;

    try {
      switch (type) {
        case 'create-product':
          await this.productModel.create({ userId, ...data });
          break;
        case 'create-category':
          await this.categoryModel.create(data);
          break;
        case 'create-producer':
          await this.producerModel.create(data);
          break;
        default:
          throw new BadRequestException(
            `Request type "${type}" is not supported for acceptance`,
          );
      }

      await this.requestModel.findByIdAndUpdate(requestId, {
        status: 'approved',
      });
      return {
        message: `Request of type "${type}" has been accepted and processed`,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to process request: ${error.message}`,
      );
    }

    // try {
    //   switch (type) {
    //     case 'create-product':
    //       await this.productModel.create(body);
    //       break;
    //     case 'create-category':
    //       await this.categoryModel.create(body);
    //       break;
    //     case 'create-producer':
    //       await this.producerModel.create(body);
    //       break;
    //     default:
    //       throw new BadRequestException(
    //         `Request type "${type}" is not supported for acceptance`,
    //       );
    //   }
    //
    //   // Update the status to "accepted" after successful processing
    //   await this.requestModel.findByIdAndUpdate(requestId, {
    //     status: 'accepted',
    //   });
    //   return {
    //     message: `Request of type "${type}" has been accepted and processed`,
    //   };
    // } catch (error) {
    //   throw new BadRequestException(
    //     `Failed to process request: ${error.message}`,
    //   );
    // }
  }

  // async updateRequestStatus(
  //   requestId: string,
  //   status: RequestStatus,
  // ): Promise<Request> {
  //   const request = await this.requestModel.findByIdAndUpdate(
  //     requestId,
  //     { status },
  //     { new: true },
  //   );
  //   if (!request) {
  //     throw new NotFoundException(`Request with ID ${requestId} not found`);
  //   }
  //   return request;
  // }
  //
  // async getPendingRequests(): Promise<Request[]> {
  //   return this.requestModel.find({ status: RequestStatus.PENDING }).exec();
  // }
  //
  // async getRequestById(requestId: string): Promise<Request> {
  //   const request = await this.requestModel.findById(requestId);
  //   if (!request) {
  //     throw new NotFoundException(`Request with ID ${requestId} not found`);
  //   }
  //   return request;
  // }
}
