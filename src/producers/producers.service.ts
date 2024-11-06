import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProducerDto } from './dto/create-producer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Producer, ProducerDocument } from './schemas/producer.schema';
import { UpdateProducerDto } from './dto/update-producer.dto';

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
  async update(id: string, updateProducerDto: UpdateProducerDto) {
    const updatedProducer = await this.producerModel
      .findByIdAndUpdate(id, updateProducerDto, { new: true })
      .exec();

    if (!updatedProducer) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return updatedProducer;
  }

  //
  async remove(id: string) {
    const result = await this.producerModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Producer with ID ${id} not found`);
    }

    return { message: `Producer with ID ${id} has been deleted successfully` };
  }
}
