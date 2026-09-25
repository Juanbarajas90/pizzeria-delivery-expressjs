import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  category: 'pizza' | 'drink' | 'dessert' | 'side';
  available: boolean;
  prepTimeMinutes: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: [true, 'El nombre es requerido'], trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: [true, 'El precio es requerido'], min: 0 },
    category: {
      type: String,
      enum: ['pizza', 'drink', 'dessert', 'side'],
      required: [true, 'La categoría es requerida'],
    },
    available: { type: Boolean, default: true },
    prepTimeMinutes: { type: Number, default: 15, min: 1 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const ProductModel = mongoose.model<IProduct>('Product', productSchema);
