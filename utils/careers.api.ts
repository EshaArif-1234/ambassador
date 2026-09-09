export interface JobApplicationData {
  jobId: string;
  jobSlug: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  experience?: string;
  linkedIn?: string;
  coverLetter: string;
}

export interface JobApplicationResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export async function submitJobApplication(data: JobApplicationData): Promise<JobApplicationResponse> {
  const res = await fetch('/api/careers/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = (await res.json()) as JobApplicationResponse;

  if (!res.ok || !json.success) {
    const fieldErrors = json.errors ? Object.values(json.errors).filter(Boolean).join(' ') : '';
    throw new Error(fieldErrors || json.message || 'Failed to submit application. Please try again.');
  }

  return json;
}
