import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// === PRODUCTION DEBUG START ===
console.log('Supabase URL exists:', !!import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase anon key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('Supabase URL value (first 30):', supabaseUrl.substring(0, 30));
console.log('Using placeholder URL?', supabaseUrl.includes('placeholder'));
console.log('Using placeholder key?', supabaseAnonKey === 'placeholder-key');
// === PRODUCTION DEBUG END ===

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
