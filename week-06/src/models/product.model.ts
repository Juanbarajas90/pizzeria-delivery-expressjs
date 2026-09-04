// ============================================
// MODELO: Product (entidad principal, con referencia a Category)
// ============================================

import { Schema, model, Types } from 'mongoose';

export interface IProduct {
  name: string;
  description?: string;
  price: number;
  available: boolean;
  prepTimeMinutes?: number;
  category: Types.ObjectId;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    price: {
      type: Number,
      required: [true, 'El precio es requerido'],
      min: [0, 'El precio no puede ser negativo'],
    },
    available: {
      type: Boolean,
      default: true,
    },
    prepTimeMinutes: {
      type: Number,
      min: [1, 'El tiempo de preparación debe ser mayor a 0'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'La categoría es requerida'],
    },
  },
  { timestamps: true },
);

export const Product = model<IProduct>('Product', productSchema);
