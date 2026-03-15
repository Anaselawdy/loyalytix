import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

console.log('Supabase URL (first 25 chars):', supabaseUrl.substring(0, 25) + '...');
console.log('Supabase Key (first 15 chars):', supabaseAnonKey.substring(0, 15) + '...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
