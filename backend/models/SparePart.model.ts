import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISparePart extends Document {
  name: string;
  slug: string;
  price?: number;
  originalPrice: number;
  stock: number;
  status: 'active' | 'inactive';
  description: string;
  images: string[];
  imagePublicIds: string[];
  specifications: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const sparePartSchema = new Schema<ISparePart>(
  {
    name: {
      type: String,
      required: [true, 'Spare part title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
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
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    images: {
      type: [String],
      default: [],
    },
    imagePublicIds: {
      type: [String],
      default: [],
    },
    specifications: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true, collection: 'spareparts' },
);

sparePartSchema.pre('save', async function () {
  if (this.isModified('name')) {
    const base = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    const SparePart =
      mongoose.models.SparePart ?? mongoose.model('SparePart', sparePartSchema, 'spareparts');
    const existing = await SparePart.findOne({ slug: base, _id: { $ne: this._id } });
    this.slug = existing ? `${base}-${Date.now().toString(36)}` : base;
  }
});

if (process.env.NODE_ENV !== 'production' && mongoose.models.SparePart) {
  delete (mongoose.models as Record<string, unknown>).SparePart;
}

sparePartSchema.index({ status: 1, createdAt: -1 });
sparePartSchema.index({ name: 'text' });

const SparePart: Model<ISparePart> =
  mongoose.models.SparePart ??
  mongoose.model<ISparePart>('SparePart', sparePartSchema, 'spareparts');

export default SparePart;
