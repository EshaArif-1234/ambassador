import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IOrderItem {
  productId?: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
  sku?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  /** Linked account when order was placed while logged in. */
  userId?: Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: IOrderItem[];
  subtotal: number;
  deliveryCharges: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  paymentId?: string;
  transactionId?: string;
  gatewayMethod?: string;
  paidAt?: Date;
  shippingAddress: {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  deliveryNotes?: string;
  notes?: string;
  failedReason?: string;
  deliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String },
    productName: { type: String, required: true, trim: true },
    productImage: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    sku: { type: String },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
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
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v: unknown[]) => Array.isArray(v) && v.length > 0,
        message: 'Order must have at least one item',
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryCharges: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'PKR' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'processing',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: { type: String, default: 'online' },
    paymentId: { type: String },
    transactionId: { type: String },
    gatewayMethod: { type: String },
    paidAt: { type: Date },
    shippingAddress: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: 'Pakistan' },
    },
    deliveryNotes: { type: String, default: '' },
    notes: { type: String, default: '' },
    failedReason: { type: String },
    deliveryDate: { type: Date },
  },
  { timestamps: true }
);

orderSchema.index({ customerEmail: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

if (process.env.NODE_ENV !== 'production' && mongoose.models.Order) {
  delete (mongoose.models as Record<string, unknown>).Order;
}

const Order: Model<IOrder> =
  mongoose.models.Order ?? mongoose.model<IOrder>('Order', orderSchema);

export default Order;
