import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yrjhzqadvfpjnuubaxnb.supabase.co';
const supabaseAnonKey = 'sb_publishable_QNDcH66tWLhJXFEry1dHUQ_8aXKCd9q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
