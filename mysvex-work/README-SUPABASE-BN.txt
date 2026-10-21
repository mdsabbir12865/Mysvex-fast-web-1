Mysvex Supabase — নিরাপদ পরবর্তী ধাপ

এই প্যাকেজে 01_mysvex_safe_migration.sql একটি additive migration। এটি orders/profiles টেবিল drop করে না, পুরোনো row মুছে না। orders-এ customer details/total/items/updated_at যোগ করে এবং order_history table + status history trigger তৈরি করে।

গুরুত্বপূর্ণ সীমাবদ্ধতা:
- এই SQL চালানো মানেই ওয়েবসাইট Supabase-এর সঙ্গে যুক্ত হয়ে যায় না। Frontend/Admin JavaScript integration আলাদা কাজ।
- বর্তমান frontend-এ localStorage ভিত্তিক client login/admin password আছে। এটিকে production authentication হিসেবে ব্যবহার করবেন না। Client login/register-কে Supabase Auth-এ এবং Admin login-কে Supabase Auth + profiles.role/is_admin() দিয়ে যাচাই করতে হবে।
- Publishable key browser-এ ব্যবহার করা যায়; service_role/secret key কখনো frontend-এ দেবেন না।
- SQL চালানোর আগে Supabase-এর Database backup নিন। তারপর SQL Editor-এ পুরো migration review করে run করুন।
- orders.id বর্তমানে bigint এবং migration সেটি বদলায় না। order_history.order_id একই type-এ reference করে।
- `is_admin()` function-এর বর্তমান implementation এবং UPDATE policy-র WITH CHECK নিশ্চিত করতে হবে; admin role client নিজে যেন সেট করতে না পারে।
- Existing policies-এ কোনো policy drop করা হয়নি, শুধু নতুন order_history policies পুনরায় চালানো যায় এমনভাবে তৈরি করা হয়েছে।

চালানোর পরে verification query:
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema='public'
AND table_name IN ('orders','profiles','order_history')
ORDER BY table_name, ordinal_position;

এরপর updated website frontend/admin integration ও Vercel deployment আলাদা করে করতে হবে।
