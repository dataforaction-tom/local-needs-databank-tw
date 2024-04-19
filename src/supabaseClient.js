import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
console.log('Api called')
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;


const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
