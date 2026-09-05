import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import type { IOrderItem } from '@/backend/models/Order.model';

export interface ICheckoutSession extends Document {
  orderNumber: string;
  userId?: Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: IOrderItem[];
  subtotal: number;
  deliveryCharges: number;
  totalAmount: number;
  deliveryNotes: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const checkoutItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String },
    productName: { type: String, required: true, trim: true },
    productImage: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    sku: { type: String },
  },
  { _id: false },
);

const checkoutSessionSchema = new Schema<ICheckoutSession>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    customerPhone: { type: String, required: true, trim: true },
    items: {
      type: [checkoutItemSchema],
      required: true,
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryCharges: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    deliveryNotes: { type: String, default: '' },
    shippingAddress: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: 'Pakistan' },
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);

if (process.env.NODE_ENV !== 'production' && mongoose.models.CheckoutSession) {
  delete (mongoose.models as Record<string, unknown>).CheckoutSession;
}

const CheckoutSession: Model<ICheckoutSession> =
  mongoose.models.CheckoutSession ??
  mongoose.model<ICheckoutSession>('CheckoutSession', checkoutSessionSchema);

export default CheckoutSession;
