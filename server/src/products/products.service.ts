import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../../../shared/models/Product';

@Injectable()
export class ProductsService {
  constructor(@InjectModel('Product') private readonly productModel: Model<Product>) {}

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async create(product: Partial<Product>): Promise<Product> {
    const newProduct = new this.productModel(product);
    return newProduct.save();
  }

  async update(id: string, product: Partial<Product>): Promise<Product> {
    return this.productModel.findByIdAndUpdate(id, product, { new: true }).exec();
  }

  async remove(id: string): Promise<any> {
    return this.productModel.findByIdAndRemove(id).exec();
  }
}
