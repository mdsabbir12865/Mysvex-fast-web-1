MYSVEX ADMIN DASHBOARD — বাংলা নির্দেশিকা
=========================================

প্যাকেজে যা আছে
- index.html, style.css, script.js: আপনার দেওয়া মূল ফাইলগুলো; Admin page-এর সঙ্গে localStorage ডেটা শেয়ার এবং basic persistence/registration/order history যোগ করার জন্য script.js-এ সীমিত পরিবর্তন করা হয়েছে।
- admin.html, admin.css, admin.js: নতুন আলাদা Admin Dashboard।

চালু করার নিয়ম
1. ZIP Extract করুন।
2. পাঁচটি ওয়েব ফাইল (index.html, style.css, script.js, admin.html, admin.css, admin.js) একই ফোল্ডারে রাখুন।
3. আপনার hosting-এর project/repository-তে ফাইলগুলো upload করুন এবং redeploy করুন।
4. ওয়েবসাইটের Admin Dashboard খুলতে https://আপনার-ডোমেইন/admin.html ভিজিট করুন।
5. বর্তমান demo password: sabbir+mahi
6. Dashboard-এ Overview, Orders, Clients, Products, Order history এবং Export/Import backup আছে।

খুব গুরুত্বপূর্ণ সীমাবদ্ধতা — অনুগ্রহ করে পড়ুন
---------------------------------------------
এই সংস্করণ Supabase বা অন্য backend ব্যবহার করে না। এটি localStorage ব্যবহার করে, তাই:
- ডেটা শুধু একই Browser + একই ডিভাইস + একই domain/origin-এ শেয়ার হয়।
- অন্য Client নিজের ফোন/কম্পিউটার থেকে order দিলে আপনার Admin-এ স্বয়ংক্রিয়ভাবে আসবে না।
- Browser data/cache clear হলে বা private/incognito session বন্ধ হলে ডেটা হারাতে পারে। নিয়মিত Export backup করুন।
- Admin password JavaScript ফাইলে দেখা যায়; এটি নিরাপদ authentication নয়। একজন technical visitor এটি bypass করতে পারে।
- Client password localStorage-এ plain text হিসেবে রাখা হয়। বাস্তব গ্রাহকের password বা সংবেদনশীল তথ্যের জন্য এটি ব্যবহার করবেন না।
- Client account disable, order approve/reject, product edits এই Browser-এর data-তেই কার্যকর।
- আগে তৈরি হওয়া order/client যদি শুধু memory-তে ছিল, পেজ reload করার আগে save না হয়ে থাকলে তা ফিরিয়ে আনা যাবে না।

বাস্তব ব্যবসায় সব Client-এর Order কেন্দ্রীয়ভাবে দেখা, নিরাপদ Admin access ও স্থায়ী history নিশ্চিত করতে server-side backend/database অপরিহার্য। আপনি backend service এড়াতে চাইলে এই সংস্করণটি local demo/control panel হিসেবে ব্যবহার করা যাবে, কিন্তু multi-customer live order management হিসেবে নয়।
