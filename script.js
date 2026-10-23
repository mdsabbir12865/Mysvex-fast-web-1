(() => {
'use strict';
const $=id=>document.getElementById(id), KEY='mysvex_store_v1';
let cart=[], products=[], activeFilter='all', appliedCoupon=null, signedIn=false, checkoutWanted=false;
const money=n=>'৳'+Number(n||0).toLocaleString('en-BD',{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
function store(){const d=read();d.products=products;localStorage.setItem(KEY,JSON.stringify(d))}
function salePrice(p){return Math.max(0,Number(p.price||0)*(1-Math.min(100,Math.max(0,Number(p.discountPercent||0)))/100))}
function renderProducts(){
 const root=$('product-list-container');if(!root)return;
 const q=($('product-search')?.value||'').toLowerCase();
 const list=products.filter(p=>(activeFilter==='all'||String(p.category||'').toLowerCase()===activeFilter)&&(`${p.name} ${p.category} ${p.desc}`).toLowerCase().includes(q));
 root.innerHTML=list.length?list.map(p=>`<article class="product-card"><div class="product-img">${p.img?`<img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy">`:'<div class="product-placeholder">MYSVEX</div>'}${Number(p.discountPercent)>0?`<span class="discount-badge">${Number(p.discountPercent)}% OFF</span>`:''}<button class="add-to-cart-btn" data-add="${esc(p.id)}" aria-label="Add ${esc(p.name)} to cart">＋</button></div><div class="product-info"><h3>${esc(p.name)}</h3><p>${esc(p.category||'Jewellery')}</p><div class="price-container">${Number(p.discountPercent)>0?`<del>${money(p.price)}</del> `:''}${money(salePrice(p))}</div><button class="btn btn-outline product-add-mobile" data-add="${esc(p.id)}">Add to bag</button></div></article>`).join(''):'<p class="empty-products">No products found. Add products from the admin dashboard.</p>';
}
function subtotal(){return cart.reduce((n,p)=>n+salePrice(p)*p.quantity,0)}
function discount(){return appliedCoupon?subtotal()*appliedCoupon.percent/100:0}
function renderCart(){
 const root=document.querySelector('.cart-items');if(root)root.innerHTML=cart.length?cart.map(p=>`<div class="cart-item"><img src="${esc(p.img||'')}" alt=""><div class="cart-item-info"><h4>${esc(p.name)}</h4><span>${money(salePrice(p))}</span><div class="quantity-control"><button data-qty="${esc(p.id)}" data-delta="-1">−</button><span>${p.quantity}</span><button data-qty="${esc(p.id)}" data-delta="1">+</button><button data-remove="${esc(p.id)}" aria-label="Remove">×</button></div></div></div>`).join(''):'<p class="empty">Your collection is empty.</p>';
 document.querySelectorAll('.cart-count').forEach(e=>e.textContent=cart.reduce((n,p)=>n+p.quantity,0));
 const total=document.querySelector('.total-amount');if(total)total.textContent=money(subtotal()-discount());
 if($('checkout-subtotal'))$('checkout-subtotal').textContent=money(subtotal());
 if($('checkout-discount'))$('checkout-discount').textContent='−'+money(discount());
 if($('checkout-total'))$('checkout-total').textContent=money(subtotal()-discount());
 const footer=document.querySelector('.cart-footer');if(footer)footer.style.display=document.querySelector('.checkout-view')?.classList.contains('active')||document.querySelector('.success-view')?.classList.contains('active')?'none':'';
}
function openCart(){document.querySelector('.cart-sidebar')?.classList.add('open');document.querySelector('.overlay')?.classList.add('active')}
function closeCart(){document.querySelector('.cart-sidebar')?.classList.remove('open');document.querySelector('.overlay')?.classList.remove('active')}
function showAuth(){if(signedIn){$('profile-modal')?.classList.add('active');return} $('auth-modal')?.classList.add('active')}
function applyCoupon(){
 const code=($('coupon-code')?.value||'').trim().toUpperCase(),msg=$('coupon-message');
 const c=(read().coupons||[]).find(x=>String(x.code).toUpperCase()===code&&x.active!==false);
 if(!code||!c){appliedCoupon=null;window.mysvexAppliedCoupon=null;if(msg){msg.textContent='Coupon is invalid or inactive.';msg.className='coupon-error'} }
 else {appliedCoupon={code:c.code,percent:Number(c.percent)};window.mysvexAppliedCoupon=appliedCoupon;if(msg){msg.textContent=`${c.percent}% discount applied!`;msg.className='coupon-success'}}
 renderCart();
}
document.addEventListener('DOMContentLoaded',()=>{
 products=Array.isArray(read().products)?read().products:[];
 renderProducts();renderCart();
 $('product-search')?.addEventListener('input',renderProducts);
 document.querySelectorAll('.filter-btn').forEach(b=>b.addEventListener('click',()=>{activeFilter=b.dataset.filter;document.querySelectorAll('.filter-btn').forEach(x=>x.classList.toggle('active',x===b));renderProducts()}));
 document.addEventListener('click',e=>{
  const add=e.target.closest('[data-add]');if(add){const p=products.find(x=>String(x.id)===add.dataset.add);if(p){const old=cart.find(x=>String(x.id)===String(p.id));old?old.quantity++:cart.push({...p,quantity:1});renderCart();openCart()}return}
  const qty=e.target.closest('[data-qty]');if(qty){const p=cart.find(x=>String(x.id)===qty.dataset.qty);if(p){p.quantity+=Number(qty.dataset.delta);if(p.quantity<1)cart=cart.filter(x=>x!==p);renderCart()}return}
  const rm=e.target.closest('[data-remove]');if(rm){cart=cart.filter(x=>String(x.id)!==rm.dataset.remove);renderCart();return}
  if(e.target.closest('.cart-toggle'))openCart();
  if(e.target.closest('.cart-close')||e.target.closest('.overlay'))closeCart();
  if(e.target.closest('.checkout-init-btn')){if(!cart.length)return; if(!signedIn){checkoutWanted=true;showAuth();const w=$('cart-auth-warning');if(w)w.style.display='block';return}document.querySelector('.cart-view')?.classList.remove('active');document.querySelector('.checkout-view')?.classList.add('active');renderCart()}
  if(e.target.closest('.back-to-cart')){document.querySelector('.checkout-view')?.classList.remove('active');document.querySelector('.cart-view')?.classList.add('active');renderCart()}
  if(e.target.closest('.close-after-success')){document.querySelector('.success-view')?.classList.remove('active');document.querySelector('.cart-view')?.classList.add('active');cart=[];appliedCoupon=null;renderCart();closeCart()}
  if(e.target.closest('.auth-trigger')||e.target.closest('#user-profile-btn'))showAuth();
  if(e.target.closest('.modal-close'))e.target.closest('.modal-overlay')?.classList.remove('active');
  if(e.target.closest('#apply-coupon'))applyCoupon();
  if(e.target.closest('#p-detail-add-btn')&&window.currentProduct){const p=window.currentProduct;const old=cart.find(x=>String(x.id)===String(p.id));old?old.quantity++:cart.push({...p,quantity:1});renderCart();openCart()}
 });
 document.querySelectorAll('.auth-tab').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.auth-tab').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.auth-form-content').forEach(x=>x.classList.toggle('active',x.id===(b.dataset.tab==='register'?'register-form':'login-form')));if($('auth-error-msg'))$('auth-error-msg').style.display='none'}));
 document.querySelector('.mobile-menu-btn')?.addEventListener('click',()=>document.querySelector('.nav-links')?.classList.toggle('mobile-open'));
 document.querySelectorAll('.nav-link').forEach(a=>a.addEventListener('click',()=>document.querySelector('.nav-links')?.classList.remove('mobile-open')));
 window.addEventListener('mysvex-auth-changed',e=>{signedIn=!!e.detail?.user;const dot=$('user-status-dot');if(dot)dot.style.display=signedIn?'block':'none';if(signedIn){$('auth-modal')?.classList.remove('active');if(checkoutWanted&&cart.length){checkoutWanted=false;document.querySelector('.cart-view')?.classList.remove('active');document.querySelector('.checkout-view')?.classList.add('active');renderCart()}}});
 const checkout=$('checkout-form');if(checkout)checkout.addEventListener('submit',e=>{if(!appliedCoupon)return;const total=subtotal()-discount();window.mysvexAppliedCoupon={code:appliedCoupon.code,percent:appliedCoupon.percent,discount:discount(),total};});
 Object.defineProperty(window,'mysvexCart',{configurable:true,get:()=>cart});
 const originalRender=renderCart;
 window.addEventListener('storage',e=>{if(e.key===KEY){products=Array.isArray(read().products)?read().products:[];renderProducts()}});
 window.addEventListener('scroll',()=>document.querySelector('.header')?.classList.toggle('scrolled',scrollY>20),{passive:true});
});
})();
