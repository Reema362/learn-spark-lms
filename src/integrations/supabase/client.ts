// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://gfwnftqkzkjxujrznhww.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdmd25mdHFremtqeHVqcnpuaHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMzI0NTAsImV4cCI6MjA2NDYwODQ1MH0.x7Yh2_8g6jI1zCJwf94WwzbT_Bh4v7XtksEg9bMhMdY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);