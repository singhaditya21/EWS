// Accounts, sync, payments and classrooms switch on only when a backend is configured.
// Without these variables the app runs exactly as before: free, device-only, no sign-in.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;

export const cloudConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
