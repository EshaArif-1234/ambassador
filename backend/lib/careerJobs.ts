import type { ICareerJob } from '@/backend/models/CareerJob.model';
import type { CareerJob } from '@/lib/careers.types';

type CareerJobDoc = ICareerJob | (ICareerJob & { _id: unknown });

export function parseStringList(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
}

export function toCareerJob(doc: CareerJobDoc): CareerJob {
  const row = doc as ICareerJob & { _id: { toString(): string } };
  return {
    id: String(row._id),
    slug: row.slug,
    title: row.title,
    department: row.department,
    location: row.location,
    city: row.city,
    type: row.type,
    workEnvironment: row.workEnvironment,
    educationLevel: row.educationLevel,
    isHot: Boolean(row.isHot),
    summary: row.summary,
    description: row.description,
    responsibilities: Array.isArray(row.responsibilities) ? row.responsibilities : [],
    requirements: Array.isArray(row.requirements) ? row.requirements : [],
    status: row.status === 'inactive' ? 'inactive' : 'active',
  };
}
