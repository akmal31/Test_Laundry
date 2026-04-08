import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://chshuphlwtbhrpivrsyf.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoc2h1cGhsd3RiaHJwaXZyc3lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2Mzg2ODgsImV4cCI6MjA5MTIxNDY4OH0.A3cmQTmoZCcEL8p-S2ofZ7wL7RTUq7FZdO2p3tb1who';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
