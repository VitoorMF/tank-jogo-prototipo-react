import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zhvdctvgqkjbpjsaaulh.supabase.co';
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_GcFNH7hQwUO7sbkgvxtRXA_d0En137Y';

export const db = createClient(SUPABASE_URL, SUPABASE_KEY);
