// ============================================
// MODELO: Category (entidad secundaria, sin referencias)
// ============================================

import { Schema, model } from 'mongoose';

export interface ICategory {
  name: string;
  description?: string;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      maxlength: 100,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true },
);

export const Category = model<ICategory>('Category', categorySchema);
