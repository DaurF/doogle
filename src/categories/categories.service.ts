import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  create(createCategoryDto: CreateCategoryDto): Promise<CategoryDocument> {
    const newCategory = new this.categoryModel(createCategoryDto);
    return newCategory.save();
  }

  findAll(): Promise<CategoryDocument[]> {
    return this.categoryModel.find().exec();
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} category`;
  // }
  //
  // update(id: number, updateCategoryDto: UpdateCategoryDto) {
  //   return `This action updates a #${id} category`;
  // }
  //
  // remove(id: number) {
  //   return `This action removes a #${id} category`;
  // }
}
