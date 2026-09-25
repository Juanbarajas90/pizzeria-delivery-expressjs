import { Schema, model, Document } from 'mongoose';

export const PRODUCT_CATEGORIES = ['pizza', 'drink', 'dessert', 'side'] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface IProduct extends Document {
  code: string;
  name: string;
  description?: string;
  price: number;
  category: ProductCategory;
  prepTimeMinutes: number;
  active: boolean;
  createdBy: string; // ID del usuario que creó el producto
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, enum: PRODUCT_CATEGORIES, required: true },
    prepTimeMinutes: { type: Number, default: 15, min: 1 },
    active: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

export const Product = model<IProduct>('Product', productSchema);
