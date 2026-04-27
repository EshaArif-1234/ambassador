import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: Types.ObjectId;
  subCategory: Types.ObjectId;
  price?: number;
  originalPrice: number;
  stock: number;
  status: 'active' | 'inactive';
  about: string;
  images: string[];
  imagePublicIds: string[];
  videos: string[];
  videoPublicIds: string[];
  specifications: Record<string, string>;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: [true, 'Subcategory is required'],
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required'],
      min: [0, 'Original price cannot be negative'],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    about: {
      type: String,
      default: '',
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    imagePublicIds: {
      type: [String],
      default: [],
    },
    videos: {
      type: [String],
      default: [],
    },
    videoPublicIds: {
      type: [String],
      default: [],
    },
    specifications: {
      type: Schema.Types.Mixed,
      default: {},
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [160, 'Meta title cannot exceed 160 characters'],
      default: '',
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [320, 'Meta description cannot exceed 320 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

// Auto-generate slug from name
productSchema.pre('save', async function () {
  if (this.isModified('name')) {
    const base = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    // Ensure slug uniqueness by appending a short id suffix when needed
    const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
    const existing = await Product.findOne({ slug: base, _id: { $ne: this._id } });
    this.slug = existing ? `${base}-${Date.now().toString(36)}` : base;
  }
});

// Clear cached model during hot reload in development so schema changes take effect
if (process.env.NODE_ENV !== 'production' && mongoose.models.Product) {
  delete (mongoose.models as Record<string, unknown>).Product;
}

const Product: Model<IProduct> =
  mongoose.models.Product ?? mongoose.model<IProduct>('Product', productSchema);

export default Product;
