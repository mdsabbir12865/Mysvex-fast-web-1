// Mysvex public Supabase client config. Publishable key is safe browsere.
window.MYSVEX_SUPABASE_URL = 'https://xljthbkmynrjgeslkpuy.supabase.co'
window.MYSVEX_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_sYcw7l_7NOgrLhkROkOHMg_dIcP2Grd';
if (!window.supabase || !window.supabase.createClient) { console.error('Supabase JS library failed to load.'); } else window.mysvexSupabase = window.supabase.createClient(window.MYSVEX_SUPABASE_URL, window.MYSVEX_SUPABASE_PUBLISHABLE_KEY, {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
