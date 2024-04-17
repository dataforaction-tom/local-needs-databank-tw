import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
console.log(supabaseUrl);
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
console.log(supabaseAnonKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
