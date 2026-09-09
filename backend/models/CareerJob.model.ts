import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICareerJob extends Document {
  title: string;
  slug: string;
  department: string;
  location: string;
  city: string;
  type: 'Full Time' | 'Part Time' | 'Contract';
  workEnvironment: 'On-site' | 'Field' | 'Hybrid';
  educationLevel: string;
  isHot: boolean;
  summary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const careerJobSchema = new Schema<ICareerJob>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      maxlength: [100, 'Department cannot exceed 100 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters'],
    },
    type: {
      type: String,
      enum: ['Full Time', 'Part Time', 'Contract'],
      required: true,
    },
    workEnvironment: {
      type: String,
      enum: ['On-site', 'Field', 'Hybrid'],
      required: true,
    },
    educationLevel: {
      type: String,
      required: [true, 'Education level is required'],
      trim: true,
      maxlength: [120, 'Education level cannot exceed 120 characters'],
    },
    isHot: {
      type: Boolean,
      default: false,
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      trim: true,
      maxlength: [500, 'Summary cannot exceed 500 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true, collection: 'careerjobs' },
);

careerJobSchema.pre('save', async function () {
  if (this.isModified('title') || !this.slug) {
    const base = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    const CareerJobModel =
      mongoose.models.CareerJob ?? mongoose.model('CareerJob', careerJobSchema, 'careerjobs');
    const existing = await CareerJobModel.findOne({ slug: base, _id: { $ne: this._id } });
    this.slug = existing ? `${base}-${Date.now().toString(36)}` : base;
  }
});

careerJobSchema.index({ status: 1, createdAt: -1 });
careerJobSchema.index({ city: 1, department: 1, type: 1 });
careerJobSchema.index({ title: 'text', summary: 'text', department: 'text', city: 'text' });

if (process.env.NODE_ENV !== 'production' && mongoose.models.CareerJob) {
  delete (mongoose.models as Record<string, unknown>).CareerJob;
}

const CareerJob: Model<ICareerJob> =
  mongoose.models.CareerJob ??
  mongoose.model<ICareerJob>('CareerJob', careerJobSchema, 'careerjobs');

export default CareerJob;
