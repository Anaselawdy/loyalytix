import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// DEBUG: verify env vars are loaded in production
console.log('[supabase.js] VITE_SUPABASE_URL exists:', !!import.meta.env.VITE_SUPABASE_URL);
console.log('[supabase.js] VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('[supabase.js] URL being used (first 30 chars):', supabaseUrl.substring(0, 30));
console.log('[supabase.js] Key is placeholder?', supabaseAnonKey === 'placeholder-key');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
