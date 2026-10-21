(() => {
  'use strict';
  const KEY = 'mysvex_store_v1';
  // Matches the legacy password in script.js. This is only a UI gate, NOT secure authentication.
  const ADMIN_PASSWORD = 'sabbir+mahi';
  const $ = id => document.getElementById(id);
  let store = loadStore();
  let toastTimer;
  function loadStore() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch (_) { return {}; }
  }
  function normalize() {
    if (!Array.isArray(store.products)) store.products = [
      {id:1,name:'Eternal Solitaire Ring',price:1250,category:'rings',img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=500',desc:'1.5ct brilliant-cut diamond in 18k white gold.',metal:'18K White Gold',weight:'4.8g',stone:'1.5ct Diamond'},
      {id:2,name:'Crescent Gold Pendant',price:850,category:'necklaces',img:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=500',desc:'Celestial beauty carved from 22k yellow gold.',metal:'22K Yellow Gold',weight:'8.2g',stone:'None'},
      {id:3,name:'Sapphire Drop Earrings',price:1800,category:'earrings',img:'https://images.unsplash.com/photo-1535633302704-b042cda6c677?auto=format&fit=crop&q=80&w=500',desc:'Blue sapphires in elegant platinum drop design.',metal:'Platinum 950',weight:'6.5g',stone:'Sapphire'}
    ];
    if (!Array.isArray(store.orders)) store.orders = [];
    if (!Array.isArray(store.users)) store.users = [];
    if (!Array.isArray(store.orderHistory)) store.orderHistory = [];
  }
  normalize();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(store)); return true; }
    catch (e) { toast('Could not save: browser storage is unavailable or full.'); return false; }
  }
  function esc(value='') { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function money(value) { return '$' + (Number(value) || 0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function date(value) { if (!value) return '—'; const d = new Date(value); return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString(); }
  function toast(msg) { const el=$('toast'); el.textContent=msg; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2800); }
  function addHistory(order, from, to, actor='Admin') {
    store.orderHistory.push({id:Date.now()+Math.random(),orderId:order.id,clientEmail:order.userEmail||'',from,to,actor,at:new Date().toISOString()});
  }
  function badge(status) { const s=String(status||'Pending'); return `<span class="status ${esc(s.toLowerCase())}">${esc(s)}</span>`; }
  function empty(msg) { return `<div class="empty">${esc(msg)}</div>`; }
  function table(headers, rows) { return rows.length ? `<table class="data-table"><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>` : empty('Nothing to show yet. Data created on this browser will appear here.'); }
  function showTab(tab) {
    document.querySelectorAll('.nav-item[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
    document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+tab));
    const titles={overview:'Good to see you.',orders:'Order management',clients:'Client directory',products:'Product catalogue',history:'Order history'};
    $('page-title').textContent=titles[tab]||'Admin Dashboard';
    if(tab==='overview') renderOverview(); if(tab==='orders') renderOrders(); if(tab==='clients') renderClients(); if(tab==='products') renderProducts(); if(tab==='history') renderHistory();
  }
  function renderOverview() {
    const pending=store.orders.filter(o=>o.status==='Pending').length;
    $('stat-clients').textContent=store.users.length; $('stat-orders').textContent=store.orders.length;
    $('stat-pending').textContent=pending; $('stat-confirmed').textContent=store.orders.filter(o=>o.status==='Confirmed').length;
    $('pending-count').textContent=pending;
    const rows=store.orders.slice().sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,6).map(o=>`<tr><td><span class="strong">#${esc(o.id)}</span><div class="sub">${esc(date(o.createdAt))}</div></td><td><span class="strong">${esc(o.userName||'Client')}</span><div class="sub">${esc(o.userEmail)}</div></td><td>${money(o.total)}</td><td>${badge(o.status)}</td><td><button class="mini-btn" data-goto="orders">Review</button></td></tr>`);
    $('recent-orders').innerHTML=table(['Order','Client','Total','Status',''],rows);
  }
  function renderOrders() {
    const term=$('order-search').value.trim().toLowerCase(), status=$('order-filter').value;
    const rows=store.orders.slice().sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).filter(o=>(status==='all'||o.status===status)&&[o.id,o.userName,o.userEmail].some(v=>String(v||'').toLowerCase().includes(term))).map(o=>{
      const itemText=Array.isArray(o.items)&&o.items.length?o.items.map(i=>`${i.name||'Item'} ×${i.quantity||1}`).join(', '):`${o.itemsCount||0} item(s)`;
      return `<tr><td><span class="strong">#${esc(o.id)}</span><div class="sub">${esc(date(o.createdAt))}</div></td><td><span class="strong">${esc(o.userName||'Client')}</span><div class="sub">${esc(o.userEmail)}</div><div class="sub">${esc(itemText)}</div></td><td>${money(o.total)}</td><td>${badge(o.status)}</td><td><div class="action-group">${o.status==='Pending'?`<button class="mini-btn approve" data-order-action="Confirmed" data-id="${esc(o.id)}">Approve</button><button class="mini-btn reject" data-order-action="Rejected" data-id="${esc(o.id)}">Reject</button>`:`<button class="mini-btn" disabled>Processed</button>`}<button class="mini-btn" data-order-detail="${esc(o.id)}">Details</button></div></td></tr>`;
    });
    $('orders-table').innerHTML=table(['Order','Customer & items','Total','Status','Actions'],rows);
    $('pending-count').textContent=store.orders.filter(o=>o.status==='Pending').length;
  }
  function renderClients() {
    const term=$('client-search').value.trim().toLowerCase();
    const rows=store.users.filter(u=>[u.name,u.email,u.id].some(v=>String(v||'').toLowerCase().includes(term))).map(u=>{
      const count=store.orders.filter(o=>o.userEmail===u.email).length;
      const status=u.status||'Active';
      return `<tr><td><span class="strong">${esc(u.name||'Unnamed client')}</span><div class="sub">${esc(u.email)}</div></td><td>${esc(u.id||'—')}</td><td>${esc(date(u.createdAt))}</td><td>${count}</td><td>${badge(status)}</td><td><div class="action-group"><button class="mini-btn" data-client-action="${status==='Disabled'?'Active':'Disabled'}" data-email="${esc(u.email)}">${status==='Disabled'?'Enable':'Disable'}</button><button class="mini-btn" data-client-detail="${esc(u.email)}">Orders</button></div></td></tr>`;
    });
    $('clients-table').innerHTML=table(['Client','Client ID','Registered','Orders','Status','Actions'],rows);
  }
  function resetProductForm() { $('product-form').reset(); $('product-id').value=''; $('product-form-title').textContent='Add a product'; }
  function renderProducts() {
    $('product-count').textContent=`${store.products.length} product${store.products.length===1?'':'s'}`;
    const rows=store.products.map(p=>`<tr><td><div class="product-cell">${p.img?`<img src="${esc(p.img)}" alt="" style="width:42px;height:42px;object-fit:cover;border-radius:8px;margin-right:10px;vertical-align:middle">`:''}<span class="strong">${esc(p.name)}</span></div><div class="sub">${esc(p.category||'')}</div></td><td>${money(p.price)}</td><td>${esc(p.metal||'—')}<div class="sub">${esc(p.weight||'')}</div></td><td><div class="action-group"><button class="mini-btn" data-product-edit="${esc(p.id)}">Edit</button><button class="mini-btn reject" data-product-delete="${esc(p.id)}">Delete</button></div></td></tr>`);
    $('products-table').innerHTML=table(['Product','Price','Attributes','Actions'],rows);
  }
  function renderHistory() {
    const term=$('history-search').value.trim().toLowerCase();
    const rows=store.orderHistory.slice().sort((a,b)=>new Date(b.at)-new Date(a.at)).filter(h=>[h.orderId,h.clientEmail,h.from,h.to,h.actor].some(v=>String(v||'').toLowerCase().includes(term))).map(h=>`<tr><td><span class="strong">#${esc(h.orderId)}</span></td><td>${esc(h.clientEmail||'—')}</td><td>${h.from?badge(h.from):'<span class="status">Created</span>'}</td><td>${badge(h.to)}</td><td>${esc(h.actor||'Admin')}</td><td>${esc(date(h.at))}</td></tr>`);
    $('history-table').innerHTML=table(['Order','Client','Previous','New status','Changed by','Time'],rows);
  }
  function updateStatus(id, next) {
    const order=store.orders.find(o=>String(o.id)===String(id)); if(!order||order.status!=='Pending') return toast('This order is no longer pending.');
    const previous=order.status; order.status=next; order.updatedAt=new Date().toISOString(); addHistory(order,previous,next,'Admin');
    if(save()){renderOverview();renderOrders();renderHistory();toast(`Order #${id} ${next.toLowerCase()}.`);}
  }
  function exportBackup() {
    const payload={...store,exportedAt:new Date().toISOString(),format:'mysvex-local-backup-v1'};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`mysvex-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);toast('Backup downloaded. Keep it somewhere safe.');
  }
  function importBackup(file) {
    const reader=new FileReader();reader.onload=()=>{try{const incoming=JSON.parse(reader.result);if(!Array.isArray(incoming.products)||!Array.isArray(incoming.orders)||!Array.isArray(incoming.users)) throw new Error('This file is not a valid Mysvex backup.');if(!confirm('Replace current browser data with this backup? Export your current data first if needed.'))return;store={products:incoming.products,orders:incoming.orders,users:incoming.users,orderHistory:Array.isArray(incoming.orderHistory)?incoming.orderHistory:[]};if(save()){renderAll();toast('Backup imported successfully.');}}catch(e){toast(e.message||'Could not import backup.');}};reader.readAsText(file);
  }
  function renderAll(){renderOverview();renderOrders();renderClients();renderProducts();renderHistory();}
  $('admin-login-form').addEventListener('submit',e=>{e.preventDefault();if($('admin-password').value===ADMIN_PASSWORD){$('login-wrap').classList.add('hidden');$('app').classList.remove('hidden');$('login-error').textContent='';$('today-label').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'}).toUpperCase();renderAll();}else{$('login-error').textContent='Incorrect password.';}});
  document.querySelectorAll('.nav-item[data-tab]').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));
  document.addEventListener('click',e=>{
    const goto=e.target.closest('[data-goto]');if(goto){showTab(goto.dataset.goto);return;}
    const action=e.target.closest('[data-order-action]');if(action){updateStatus(action.dataset.id,action.dataset.orderAction);return;}
    const detail=e.target.closest('[data-order-detail]');if(detail){const o=store.orders.find(x=>String(x.id)===detail.dataset.orderDetail);if(o)alert(`Order #${o.id}\nClient: ${o.userName||''} (${o.userEmail||''})\nItems: ${Array.isArray(o.items)?o.items.map(i=>`${i.name} × ${i.quantity}`).join('\n'):(o.itemsCount||0)+' item(s)'}\nTotal: ${money(o.total)}\nStatus: ${o.status}\nCreated: ${date(o.createdAt)}\nUpdated: ${date(o.updatedAt)}`);return;}
    const clientAction=e.target.closest('[data-client-action]');if(clientAction){const u=store.users.find(x=>x.email===clientAction.dataset.email);if(u){u.status=clientAction.dataset.clientAction;save();renderClients();toast(`Client ${u.status.toLowerCase()}.`);}return;}
    const clientDetail=e.target.closest('[data-client-detail]');if(clientDetail){const email=clientDetail.dataset.clientDetail;const os=store.orders.filter(o=>o.userEmail===email);alert(os.length?os.map(o=>`#${o.id} · ${o.status} · ${money(o.total)} · ${date(o.createdAt)}`).join('\n'):'No orders for this client.');return;}
    const edit=e.target.closest('[data-product-edit]');if(edit){const p=store.products.find(x=>String(x.id)===edit.dataset.productEdit);if(p){$('product-id').value=p.id;$('p-name').value=p.name||'';$('p-price').value=p.price||0;$('p-category').value=p.category||'rings';$('p-img').value=p.img||'';$('p-metal').value=p.metal||'';$('p-weight').value=p.weight||'';$('p-stone').value=p.stone||'';$('p-desc').value=p.desc||'';$('product-form-title').textContent='Edit product';$('product-form').scrollIntoView({behavior:'smooth',block:'center'});}return;}
    const del=e.target.closest('[data-product-delete]');if(del){if(confirm('Delete this product from this browser catalogue?')){store.products=store.products.filter(p=>String(p.id)!==del.dataset.productDelete);if(save()){renderProducts();toast('Product deleted.');}}}
  });
  $('order-search').addEventListener('input',renderOrders);$('order-filter').addEventListener('change',renderOrders);$('client-search').addEventListener('input',renderClients);$('history-search').addEventListener('input',renderHistory);
  $('product-form').addEventListener('submit',e=>{e.preventDefault();const id=$('product-id').value;const item={id:id||Date.now(),name:$('p-name').value.trim(),price:Number($('p-price').value),category:$('p-category').value,img:$('p-img').value.trim(),metal:$('p-metal').value.trim(),weight:$('p-weight').value.trim(),stone:$('p-stone').value.trim(),desc:$('p-desc').value.trim()};if(!item.name||!Number.isFinite(item.price)||item.price<0)return toast('Enter a valid product name and price.');if(id){const i=store.products.findIndex(p=>String(p.id)===String(id));if(i>=0)store.products[i]={...store.products[i],...item};}else store.products.push(item);if(save()){resetProductForm();renderProducts();toast('Product saved in this browser.');}});
  $('reset-product').addEventListener('click',resetProductForm);$('export-btn').addEventListener('click',exportBackup);$('backup-btn').addEventListener('click',exportBackup);$('import-file').addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];if(f)importBackup(f);e.target.value='';});
  $('logout').addEventListener('click',()=>{$('app').classList.add('hidden');$('login-wrap').classList.remove('hidden');$('admin-password').value='';});
  window.addEventListener('storage',e=>{if(e.key===KEY){store=loadStore();normalize();renderAll();toast('Data refreshed from another tab.');}});
})();
