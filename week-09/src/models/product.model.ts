import mongoose, { Schema, Document } from 'mongoose';
import type { ProductCategory } from '../types/index.js';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  available: boolean;
  prepTimeMinutes: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, enum: ['pizza', 'drink', 'dessert', 'side'], required: true },
    available: { type: Boolean, default: true },
    prepTimeMinutes: { type: Number, default: 15, min: 1 },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

export const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);
