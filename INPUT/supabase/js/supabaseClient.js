// 2° — Creates the Supabase client (uses the global `supabase` from the CDN)
const SUPABASE_URL = 'https://tnhepukgifhrhtxszkif.supabase.co';
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuaGVwdWtnaWZocmh0eHN6a2lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwODEyMzQsImV4cCI6MjEwNzY1NzIzNH0.81KZtOjYQYCFzprzmwI6mpbmr1vAssg4J3RFN77Wg80";

// Named `db` so it does not clash with the global `supabase`
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
