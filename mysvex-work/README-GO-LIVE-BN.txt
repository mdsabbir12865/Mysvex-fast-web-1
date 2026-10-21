MYSVEX — Supabase + Vercel (দ্রুত সেটআপ)

যা এই প্যাকেজে সংযুক্ত করা হয়েছে:
- Client registration/login: Supabase Auth
- Customer order insert: public.orders
- Admin sign-in: Supabase Auth + public.profiles.role = 'admin'
- Admin orders list/status updates: Supabase
- Status audit trail: public.order_history (existing SQL triggers)

গুরুত্বপূর্ণ: আমি আপনার Supabase/Vercel account-এ সরাসরি login বা deploy করতে পারি না। নিচের ধাপগুলো আপনার Dashboard-এ একবার করতে হবে।

১) Supabase Auth-এ Admin user তৈরি
- Supabase Dashboard > Authentication > Users
- sabbirhowlader68@gmail.com দিয়ে user তৈরি করুন অথবা সাইটের Register form দিয়ে account খুলে email confirm করুন।
- account তৈরি হওয়ার পর SQL Editor-এ 02_admin_role_setup.sql চালান।
- query result-এ role=admin নিশ্চিত করুন।

২) is_admin() function/policies পরীক্ষা
- আপনার আগের policies public.is_admin() ব্যবহার করে। নিশ্চিত করুন function authenticated user-এর profiles.role='admin' দেখে এবং SECURITY DEFINER হলে search_path নিরাপদভাবে public-এ সেট করা।
- orders SELECT policy-তে user_id=auth.uid() OR public.is_admin() থাকতে হবে।
- orders INSERT policy-তে user_id=auth.uid() AND status='pending' থাকতে হবে।
- orders UPDATE policy-তে USING ও WITH CHECK—দুটিতেই public.is_admin() থাকতে হবে।
- profiles-এর client নিজে role=admin করতে পারে এমন কোনো INSERT/UPDATE policy রাখবেন না।
- anon/public access দেবেন না। service_role/secret key কখনো frontend বা Vercel public env-এ দেবেন না।

৩) Vercel deployment
- এই ZIP extract করুন। Vercel Dashboard > Add New > Project > Git repository import করুন, অথবা Vercel CLI দিয়ে project deploy করুন।
- plain static HTML project; Framework Preset: Other, Build Command ফাঁকা, Output Directory `.`।
- root-এ index.html, admin.html, script.js, admin.js, supabase-config.js, supabase-integration.js, style.css, admin.css থাকতে হবে।
- Deploy-এর পর / এবং /admin.html খুলে পরীক্ষা করুন।

৪) Auth settings
- Supabase Dashboard > Authentication > URL Configuration-এ Site URL-এ আপনার Vercel production URL দিন।
- Redirect URLs-এ production domain এবং localhost development URL যোগ করুন।
- Email confirmation চালু থাকলে register করার পরে email confirm করে login করুন।

৫) Live test
- Client account দিয়ে login → cart-এ item → checkout-এ নাম/ফোন/address → Confirm Order।
- Supabase Table Editor > orders-এ row এসেছে কি না দেখুন।
- Admin email/password দিয়ে /admin.html login → Orders-এ order দেখুন → Confirm/Reject → order_history-তে history দেখুন।

সীমাবদ্ধতা/পরীক্ষা:
- Existing storefront product catalogue এখনো static/local browser data; এই package orders/auth/admin orders/history connect করে। Product CRUD cloud database-এ সংযুক্ত নয়।
- Existing old localStorage orders স্বয়ংক্রিয়ভাবে Supabase-এ migrate করা হয়নি।
- আপনার schema-এর পুরোনো constraints/policies ভিন্ন হলে live test-এ error দেখা দিতে পারে; error text দিয়ে ঠিক করতে হবে।
- এই package-এ browser publishable key আছে—এটি public key, secret/service_role key নয়। Security অবশ্যই RLS policies-এর ওপর নির্ভরশীল।
