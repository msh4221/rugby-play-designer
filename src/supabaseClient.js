import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hvatdgtsaqpijpvobjur.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CNmrLN5KnwpjxZjMsD6D5w_EPrT58Qm';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
