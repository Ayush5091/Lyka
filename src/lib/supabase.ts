import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Safe for both client and server
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ONLY use on server (Route Handlers, Server Actions)
export const supabaseAdmin = typeof window === 'undefined' 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;
