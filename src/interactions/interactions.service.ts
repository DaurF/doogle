import { Injectable } from '@nestjs/common';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Interaction } from './schemas/interaction.schema';

@Injectable()
export class InteractionsService {
  constructor(
    @InjectModel(Interaction.name) private interactionModel: Model<Interaction>,
  ) {}

  create(createInteractionDto: CreateInteractionDto) {
    const newInteraction = new this.interactionModel(createInteractionDto);
    return newInteraction.save();
  }

  findAll() {
    return this.interactionModel.find().exec();
  }

  // findOne(id: number) {
  //   return this.interactionModel.findOne();
  // }

  // update(id: number, updateInteractionDto: UpdateInteractionDto) {
  //   return `This action updates a #${id} interaction`;
  // }
  //
  // remove(id: number) {
  //   return `This action removes a #${id} interaction`;
  // }
}
