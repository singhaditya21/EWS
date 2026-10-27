// The Supabase client is loaded only when a backend is configured, so free users on the
// device-only build never download it.
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL, cloudConfigured } from './config';

let clientPromise: Promise<SupabaseClient> | null = null;

export const getClient = (): Promise<SupabaseClient> => {
  if (!cloudConfigured) return Promise.reject(new Error('Accounts are not set up on this site yet.'));
  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, { auth: { persistSession: true, autoRefreshToken: true } })
  );
  return clientPromise;
};

/** Turns low-level network errors into words a parent or teacher can act on. */
export const friendlyError = (message: string) =>
  /failed to fetch|networkerror|load failed|fetch failed/i.test(message)
    ? 'Couldn’t reach OmniLearn. Check your internet connection and try again.'
    : message;

/** Calls an Edge Function and returns its JSON, throwing a readable error on failure. */
export const callFunction = async <T,>(name: string, body: Record<string, unknown>): Promise<T> => {
  const client = await getClient();
  const { data, error } = await client.functions.invoke(name, { body });
  if (error) {
    let message = error.message;
    try {
      const ctx = (error as { context?: Response }).context;
      const json = ctx ? await ctx.json() : null;
      if (json?.error) message = json.error;
    } catch {
      // Keep the generic message.
    }
    throw new Error(friendlyError(message));
  }
  return data as T;
};
