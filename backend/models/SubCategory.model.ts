import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ISubCategory extends Document {
  title: string;
  slug: string;
  image: string;
  imagePublicId: string;
  /** Parent categories (many-to-many from subcategory → category). */
  categoryIds: Types.ObjectId[];
  status: 'active' | 'inactive';
  metaTitle?: string;
  createdAt: Date;
  updatedAt: Date;
}

const subCategorySchema = new Schema<ISubCategory>(
  {
    title: {
      type: String,
      required: [true, 'Subcategory title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    imagePublicId: {
      type: String,
      default: '',
    },
    categoryIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
      required: [true, 'At least one parent category is required'],
      validate: {
        validator(v: unknown[]) {
          return Array.isArray(v) && v.length >= 1;
        },
        message: 'At least one parent category is required',
      },
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [160, 'Meta title cannot exceed 160 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

// Slug from title only (same title in different category trees may share a slug URL-wise; enforce uniqueness in routing if needed)
subCategorySchema.pre('save', function () {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }
});

if (process.env.NODE_ENV !== 'production' && mongoose.models.SubCategory) {
  delete (mongoose.models as Record<string, unknown>).SubCategory;
}

const SubCategory: Model<ISubCategory> =
  mongoose.models.SubCategory ??
  mongoose.model<ISubCategory>('SubCategory', subCategorySchema);

export default SubCategory;
