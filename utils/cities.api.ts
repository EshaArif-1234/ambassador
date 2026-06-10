/** Fetch all Pakistan cities for address / checkout dropdowns. */
export async function fetchPakistanCities(): Promise<string[]> {
  const res = await fetch('/api/cities', { cache: 'force-cache' });
  const json = (await res.json()) as {
    success?: boolean;
    data?: string[];
    message?: string;
  };

  if (!res.ok || !json.success || !Array.isArray(json.data)) {
    throw new Error(json.message ?? 'Could not load cities.');
  }

  return json.data;
}
