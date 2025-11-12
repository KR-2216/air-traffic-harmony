import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://guvoekkxonwpxmlzxkgh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dm9la2t4b253cHhtbHp4a2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NTY3MTMsImV4cCI6MjA3ODUzMjcxM30.EeF2d1jRwYfA6mH6Fz0FS8BruW3BQIWOQxr1J8AHVU0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
