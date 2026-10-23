// Mysvex public Supabase client config. Publishable key is safe for browser use.
MYSVEX_SUPABASE_URL = 'https://xljthbkmynrjgeslkpuy.supabase.co/rest/v1/';
MYSVEX_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_N8x42aYHNH4k5PpURse5iQ_-jckNJmH';
mysvexSupabase =supabase.createClient(MYSVEX_SUPABASE_URL,MYSVEX_SUPABASE_PUBLISHABLE_KEY, {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
