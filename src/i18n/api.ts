/**
 * Loads a single translation key from the backend.
 * GET /api/language/{key}  → { value: string }
 */
export async function fetchTranslation(key: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/language/${encodeURIComponent(key)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { value?: string };
    return data.value ?? null;
  } catch {
    return null;
  }
}
