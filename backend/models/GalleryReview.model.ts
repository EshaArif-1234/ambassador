import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IGalleryReview extends Document {
  name: string;
  role: string;
  /** Testimonial / description text */
  review: string;
  videoUrl: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const galleryReviewSchema = new Schema<IGalleryReview>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
      maxlength: [200, 'Role cannot exceed 200 characters'],
    },
    review: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: '',
    },
    videoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

galleryReviewSchema.index({ name: 'text', role: 'text', review: 'text' });
galleryReviewSchema.index({ status: 1, createdAt: -1 });

if (process.env.NODE_ENV !== 'production' && mongoose.models.GalleryReview) {
  delete (mongoose.models as Record<string, unknown>).GalleryReview;
}

const GalleryReview: Model<IGalleryReview> =
  mongoose.models.GalleryReview ??
  mongoose.model<IGalleryReview>('GalleryReview', galleryReviewSchema);

export default GalleryReview;
