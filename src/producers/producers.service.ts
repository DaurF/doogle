import { Injectable } from '@nestjs/common';
import { CreateProducerDto } from './dto/create-producer.dto';
import { UpdateProducerDto } from './dto/update-producer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from '../products/schemas/product.schema';
import { Model } from 'mongoose';
import { Producer, ProducerDocument } from './schemas/producer.schema';

@Injectable()
export class ProducersService {
  constructor(
    @InjectModel(Producer.name) private producerModel: Model<Producer>,
  ) {}

  create(createProducerDto: CreateProducerDto): Promise<ProducerDocument> {
    const newProducer = new this.producerModel(createProducerDto);
    return newProducer.save();
  }

  findAll(): Promise<ProducerDocument[]> {
    return this.producerModel.find().exec();
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} producer`;
  // }
  //
  // update(id: number, updateProducerDto: UpdateProducerDto) {
  //   return `This action updates a #${id} producer`;
  // }
  //
  // remove(id: number) {
  //   return `This action removes a #${id} producer`;
  // }
}
