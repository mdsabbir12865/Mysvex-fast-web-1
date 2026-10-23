/* Mysvex Supabase Auth + durable customer orders integration. */
(() => {
  const sb = window.mysvexSupabase;
  if (!sb) { console.error('Mysvex Supabase client did not load.'); return; }
  const $ = id => document.getElementById(id);
  let authUser = null;
  let profile = null;
  const showError = msg => { const e=$('auth-error-msg'); if(e){e.textContent=msg; e.style.display='block';} else alert(msg); };
  const setUser = async user => {
    authUser=user; profile=null;
    if (!user) return;
    const {data:p,error}=await sb.from('profiles').select('id,full_name,role').eq('id',user.id).maybeSingle();
    if(error) console.warn('Profile read:',error.message); else profile=p;
    if (!profile) {
      const fullName=user.user_metadata?.full_name||user.email;
      const {error:insertError}=await sb.from('profiles').insert({id:user.id,full_name:fullName,role:'client'});
      if(!insertError) profile={id:user.id,full_name:fullName,role:'client'};
      else if(!/duplicate|already exists/i.test(insertError.message)) console.warn('Profile creation failed. Check profiles table policies:',insertError.message);
    }
    window.dispatchEvent(new CustomEvent('mysvex-auth-changed',{detail:{user,profile}}));
    const name=(profile&&profile.full_name)||user.user_metadata?.full_name||user.email;
    const dot=$('user-status-dot'); if(dot) dot.style.display='block';
    if($('profile-display-name')) $('profile-display-name').innerText=name;
    if($('profile-display-email')) $('profile-display-email').innerText=user.email||'';
    const {data:rows,error:oe}=await sb.from('orders').select('*').order('created_at',{ascending:false});
    if(!oe) {
      const normalized=rows.map(o=>({id:o.id,userId:o.user_id,userEmail:user.email,userName:o.customer_name||name,total:Number(o.total_amount||0),status:({pending:'Pending',confirmed:'Confirmed',rejected:'Rejected',shipped:'Shipped',delivered:'Delivered'})[String(o.status).toLowerCase()]||o.status,items:o.items||[],itemsCount:(o.items||[]).reduce((n,i)=>n+Number(i.quantity||1),0),createdAt:o.created_at,updatedAt:o.updated_at}));
      // The existing dashboard only renders current user's orders.
      window.dispatchEvent(new CustomEvent('mysvex-orders-loaded',{detail:{orders:normalized.filter(o=>o.userId===user.id)}}));
      const list=$('client-order-list'); if(list){list.innerHTML=''; const own=normalized.filter(o=>o.userId===user.id); if(!own.length) list.innerHTML='<p style="text-align:center;padding:1rem">No orders yet.</p>'; own.forEach(o=>{const d=document.createElement('div');d.className='order-card';d.innerHTML=`<div><b>#ORD-${o.id}</b><div>${o.itemsCount} items — $${o.total.toFixed(2)}</div></div><span class="order-badge">${o.status}</span>`;list.appendChild(d);});}
    }
  };
  document.addEventListener('DOMContentLoaded', async () => {
    const {data:{session}}=await sb.auth.getSession(); if(session?.user) await setUser(session.user);
    sb.auth.onAuthStateChange((_event,session)=>{ if(session?.user) setTimeout(()=>setUser(session.user),0); else {authUser=null;profile=null;} });
    const reg=$('register-form'); if(reg) reg.addEventListener('submit',async e=>{
      e.preventDefault(); e.stopImmediatePropagation();
      const name=$('r-name')?.value.trim(),email=$('r-email')?.value.trim().toLowerCase(),password=$('r-pass')?.value;
      if(!name||!email||!password) return showError('Please complete all registration fields.');
      if(password.length<6) return showError('Password must be at least 6 characters.');
      const btn=reg.querySelector('[type="submit"]'); if(btn) btn.disabled=true;
      try {
        const {data,error}=await sb.auth.signUp({email,password,options:{data:{full_name:name}}});
        if(error) return showError(error.message);
        if(data.user && data.session) {
          const {error:pe}=await sb.from('profiles').upsert({id:data.user.id,full_name:name,role:'client'},{onConflict:'id'});
          if(pe) console.warn('Profile creation failed; check Supabase profiles policies:',pe.message);
          await setUser(data.user); $('auth-modal')?.classList.remove('active');
          if($('auth-error-msg')) $('auth-error-msg').style.display='none';
        } else {
          showError('Registration created. Check your email to confirm, then sign in.');
        }
      } catch(err) { showError(err.message||'Registration failed. Please try again.'); }
      finally { if(btn) btn.disabled=false; }
    },true);
    const login=$('login-form'); if(login) login.addEventListener('submit',async e=>{
      e.preventDefault(); e.stopImmediatePropagation();
      const email=$('l-email')?.value.trim().toLowerCase(),password=$('l-pass')?.value;
      if(!email||!password) return showError('Enter your email and password.');
      const btn=login.querySelector('[type="submit"]'); if(btn) btn.disabled=true;
      try {
        const {data,error}=await sb.auth.signInWithPassword({email,password});
        if(error) return showError(error.message);
        await setUser(data.user); $('auth-modal')?.classList.remove('active');
        if($('auth-error-msg')) $('auth-error-msg').style.display='none';
      } catch(err) { showError(err.message||'Sign in failed. Please try again.'); }
      finally { if(btn) btn.disabled=false; }
    },true);
    const checkout=$('checkout-form'); if(checkout) checkout.addEventListener('submit',async e=>{e.preventDefault();e.stopImmediatePropagation();const {data:{user}}=await sb.auth.getUser();if(!user){$('auth-modal').classList.add('active');return showError('Please sign in before placing an order.');}const cart=Array.isArray(window.mysvexCart)?window.mysvexCart:[]; // legacy cart is closed over; read current UI as fallback below
      let items=cart;
      if(!items.length){const names=[...document.querySelectorAll('.cart-item')];items=names.map(el=>({name:el.querySelector('h4')?.textContent||'Item',quantity:1,price:Number((el.querySelector('span')?.textContent||'').match(/[\d.]+/)?.[0]||0)}));}
      if(!items.length)return showError('Your collection is empty.');
      const subtotal=items.reduce((n,i)=>n+Number(i.price||0)*(1-Math.min(100,Math.max(0,Number(i.discountPercent||0)))/100)*Number(i.quantity||1),0);const coupon=window.mysvexAppliedCoupon||null;const discount=coupon?Math.min(subtotal,subtotal*Math.min(100,Math.max(0,Number(coupon.percent||0)))/100):0;const total=Math.max(0,subtotal-discount);
      const payload={user_id:user.id,item_name:items.map(i=>i.name).join(', ').slice(0,250),quantity:items.reduce((n,i)=>n+Number(i.quantity||1),0),status:'pending',customer_name:$('full-name').value.trim(),customer_phone:$('phone').value.trim(),delivery_address:$('address').value.trim(),total_amount:total,items:items.map(i=>({id:i.id||null,name:i.name,price:Number(i.price||0)*(1-Math.min(100,Math.max(0,Number(i.discountPercent||0)))/100),quantity:Number(i.quantity||1)}))};
      const {data:order,error}=await sb.from('orders').insert(payload).select('*').single();if(error)return showError('Order could not be saved: '+error.message);
      $('order-id-display').innerText='#ORD-'+order.id;document.querySelector('.checkout-view').classList.remove('active');document.querySelector('.success-view').classList.add('active');document.querySelector('.cart-footer').style.display='none';await setUser(user);alert('Order saved to your Mysvex account.');},true);
    const logout=$('logout-btn'); if(logout) logout.addEventListener('click',async e=>{e.preventDefault();await sb.auth.signOut();authUser=null;profile=null;if($('user-status-dot'))$('user-status-dot').style.display='none';$('profile-modal').classList.remove('active');},true);
  });
})();
