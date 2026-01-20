import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://erwerzhxajmgvaguqglz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyd2Vyemh4YWptZ3ZhZ3VxZ2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNzIwMDcsImV4cCI6MjA3MTY0ODAwN30.PmAR5c7qTzm8-REXyUN9Jnfl-a-Vox_IAO8ls9xoCu8';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
