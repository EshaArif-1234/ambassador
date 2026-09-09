export type JobType = 'Full Time' | 'Part Time' | 'Contract';
export type WorkEnvironment = 'On-site' | 'Field' | 'Hybrid';
export type CareerJobStatus = 'active' | 'inactive';

export type CareerJob = {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  city: string;
  type: JobType;
  workEnvironment: WorkEnvironment;
  educationLevel: string;
  isHot: boolean;
  summary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  status?: CareerJobStatus;
};

export const JOB_TYPES: JobType[] = ['Full Time', 'Part Time', 'Contract'];
export const WORK_ENVIRONMENTS: WorkEnvironment[] = ['On-site', 'Field', 'Hybrid'];

export const JOB_DEPARTMENT_OPTIONS = [
  'Sales',
  'Service',
  'Operations',
  'Marketing',
  'Finance',
  'Logistics',
  'HR',
  'Other',
];
