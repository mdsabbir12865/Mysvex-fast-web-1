// Mysvex public Supabase client config. Publishable key is safe for browser use.
window.MYSVEX_SUPABASE_URL = 'https://uaverzpqtgxcubqthmnx.supabase.co';
window.MYSVEX_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_sYcw7l_7NOgrLhkROkOHMg_dIcP2Grd';
window.mysvexSupabase = window.supabase.createClient(window.MYSVEX_SUPABASE_URL, window.MYSVEX_SUPABASE_PUBLISHABLE_KEY, {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
