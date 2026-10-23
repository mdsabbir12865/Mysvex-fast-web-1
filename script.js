document.addEventListener('DOMContentLoaded', () => {
    // Shared Data Store
    let products = [
        { id: 1, name: "Pearl Bloom Earrings", price: 650, category: "earrings", img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=85&w=600", desc: "Elegant pearl-look statement earrings for day-to-evening styling.", metal: "Fashion alloy / pearl-look finish", weight: "Lightweight", stone: "Pearl-look detail" },
        { id: 2, name: "Everyday Layered Necklace", price: 890, category: "necklaces", img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&q=85&w=600", desc: "A versatile fashion necklace designed for layering and everyday outfits.", metal: "Fashion jewellery alloy", weight: "Lightweight", stone: "Decorative detail" },
        { id: 3, name: "Blush Statement Ring", price: 450, category: "rings", img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=85&w=600", desc: "A playful statement ring to add a little personality to your look.", metal: "Fashion jewellery alloy", weight: "Lightweight", stone: "Decorative accent" }
    ];
    // Shared browser store. This keeps data across reloads on THIS browser only.
    const STORE_KEY = 'mysvex_store_v1';
    function readStore() {
        try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
        catch (_) { return {}; }
    }
    let store = readStore();
    if (Array.isArray(store.products)) {
        products = store.products;
        const oldDemoNames = ['Eternal Solitaire Ring', 'Crescent Gold Pendant', 'Sapphire Drop Earrings'];
        if (products.every(p => oldDemoNames.includes(p.name))) {
            products = [
                { id: 1, name: "Pearl Bloom Earrings", price: 650, category: "earrings", img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=85&w=600", desc: "Elegant pearl-look statement earrings for day-to-evening styling.", metal: "Fashion alloy / pearl-look finish", weight: "Lightweight", stone: "Pearl-look detail" },
                { id: 2, name: "Everyday Layered Necklace", price: 890, category: "necklaces", img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&q=85&w=600", desc: "A versatile fashion necklace designed for layering and everyday outfits.", metal: "Fashion jewellery alloy", weight: "Lightweight", stone: "Decorative detail" },
                { id: 3, name: "Blush Statement Ring", price: 450, category: "rings", img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=85&w=600", desc: "A playful statement ring to add a little personality to your look.", metal: "Fashion jewellery alloy", weight: "Lightweight", stone: "Decorative accent" }
            ];
        }
    }
    let cart = [];
    window.mysvexCart = cart;
    let orders = Array.isArray(store.orders) ? store.orders : [];
    let users = Array.isArray(store.users) ? store.users : [];
    let orderHistory = Array.isArray(store.orderHistory) ? store.orderHistory : [];
    let currentUser = null;
    function persistStore() {
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify({ products, orders, users, orderHistory }));
            return true;
        } catch (err) {
            console.error('Could not save Mysvex data:', err);
            alert('Browser storage is full or unavailable. Please export your data and try again.');
            return false;
        }
    }
    function addOrderHistory(order, oldStatus, newStatus, actor='Admin') {
        orderHistory.push({ id: Date.now() + Math.random(), orderId: order.id,
            clientEmail: order.userEmail, from: oldStatus, to: newStatus,
            actor, at: new Date().toISOString() });
        persistStore();
    }
    persistStore();

    // Elements
    const productListContainer = document.getElementById('product-list-container');
    const cartCountLabel = document.querySelector('.cart-count');
    const totalAmountSpan = document.querySelector('.total-amount');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const overlay = document.querySelector('.overlay');

    // UI Rendering
    function renderProducts(filter = 'all') {
        if (!productListContainer) return;
        productListContainer.innerHTML = '';
        const term = (document.getElementById('product-search')?.value || '').trim().toLowerCase();
        const filtered = products.filter(p => (filter === 'all' || String(p.category || '').toLowerCase() === filter) && (!term || `${p.name} ${p.desc} ${p.category}`.toLowerCase().includes(term)));

        if (!filtered.length) { productListContainer.innerHTML = '<p class="empty-products">No matching pieces found. অন্য পণ্য খুঁজে দেখুন।</p>'; return; }
        filtered.forEach(p => {
            const card = document.createElement('article');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-img">
                    <img src="${p.img}" alt="${p.name}">
                    <button class="add-to-cart-btn" data-id="${p.id}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                </div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p>${p.desc}</p>
                    <div class="price-container">৳${Number(p.price).toLocaleString("en-BD")}</div>
                </div>
            `;
            card.addEventListener('click', () => showProductDetails(p.id));
            card.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                addToCart(p.id);
            });
            productListContainer.appendChild(card);
        });
    }

    function showProductDetails(id) {
        const p = products.find(x => x.id == id);
        if(!p) return;
        document.getElementById('p-detail-img').src = p.img;
        document.getElementById('p-detail-name').innerText = p.name;
        document.getElementById('p-detail-price-now').innerText = `৳${Number(p.price).toLocaleString("en-BD")}`;
        document.getElementById('p-detail-desc').innerText = p.desc;
        document.getElementById('p-detail-category').innerText = p.category;
        document.getElementById('p-detail-metal').innerText = p.metal || '--';
        document.getElementById('p-detail-weight').innerText = p.weight || '--';
        document.getElementById('p-detail-stone').innerText = p.stone || '--';
        
        const addBtn = document.getElementById('p-detail-add-btn');
        const newBtn = addBtn.cloneNode(true);
        addBtn.parentNode.replaceChild(newBtn, addBtn);
        newBtn.addEventListener('click', () => { addToCart(p.id); document.getElementById('product-detail-modal').classList.remove('active'); });

        document.getElementById('product-detail-modal').classList.add('active');
    }

    function addToCart(id) {
        const p = products.find(x => x.id == id);
        const existing = cart.find(i => i.id == id);
        if (existing) existing.quantity++;
        else cart.push({ ...p, quantity: 1 });
        updateCartUI();
        cartSidebar.classList.add('open');
        overlay.classList.add('active');
    }

    function updateCartUI() {
        const count = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartCountLabel.textContent = count;
        cartItemsContainer.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${item.img}">
                <div style="flex:1;">
                    <h4 style="font-size:0.8rem;">${item.name}</h4>
                    <span style="font-size:0.7rem; color:var(--accent);">৳${Number(item.price).toLocaleString("en-BD")} x ${item.quantity}</span>
                </div>
            `;
            cartItemsContainer.appendChild(div);
        });
        totalAmountSpan.textContent = `৳${Number(total).toLocaleString("en-BD")}`;
        document.getElementById('cart-auth-warning').style.display = currentUser ? 'none' : 'block';
    }

    // Client Dashboard & Profile
    function renderClientDashboard() {
        if (!currentUser) return;
        const userOrders = orders.filter(o => o.userEmail === currentUser.email);
        const confirmed = userOrders.filter(o => o.status === 'Confirmed').length;
        
        document.getElementById('stat-total-orders').innerText = userOrders.length;
        document.getElementById('stat-confirmed-orders').innerText = confirmed;
        
        const list = document.getElementById('client-order-list');
        list.innerHTML = '';
        if (userOrders.length === 0) {
            list.innerHTML = '<p style="text-align:center; font-size:0.8rem; color:#ccc; padding:2rem;">No orders yet.</p>';
        } else {
            userOrders.slice().reverse().forEach(o => {
                const div = document.createElement('div');
                div.className = 'order-card';
                div.innerHTML = `
                    <div>
                        <div style="font-size:0.75rem; font-weight:700;">#ORD-${o.id}</div>
                        <div style="font-size:0.65rem; color:var(--text-muted);">${o.itemsCount} items — ৳${Number(o.total).toLocaleString("en-BD")}</div>
                    </div>
                    <span class="order-badge badge-${o.status.toLowerCase()}">${o.status}</span>
                `;
                list.appendChild(div);
            });
        }
    }

    // Admin Functionality
    function renderAdminInventory() {
        const list = document.querySelector('.admin-product-list');
        list.innerHTML = '';
        products.forEach(p => {
            const row = document.createElement('div');
            row.className = 'admin-product-item';
            row.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                    <img src="${p.img}">
                    <input type="text" class="adm-input" value="${p.img}" data-key="img" data-id="${p.id}" style="font-size:10px; width:60px; padding:2px;" placeholder="URL">
                </div>
                <div style="display:flex; flex-direction:column; gap:5px;">
                    <input type="text" class="adm-input" value="${p.name}" data-key="name" data-id="${p.id}" placeholder="Name">
                    <input type="number" class="adm-input" value="${p.price}" data-key="price" data-id="${p.id}" placeholder="Price">
                    <textarea class="adm-input" data-key="desc" data-id="${p.id}" rows="2" placeholder="Description">${p.desc}</textarea>
                </div>
                <div style="display:flex; flex-direction:column; gap:5px;">
                    <input type="text" class="adm-input" value="${p.metal || ''}" placeholder="Metal" data-key="metal" data-id="${p.id}">
                    <input type="text" class="adm-input" value="${p.weight || ''}" placeholder="Weight" data-key="weight" data-id="${p.id}">
                    <input type="text" class="adm-input" value="${p.stone || ''}" placeholder="Stone" data-key="stone" data-id="${p.id}">
                </div>
                <div style="display:flex; flex-direction:column; gap:5px;">
                    <button class="btn btn-primary adm-save-btn" data-id="${p.id}" style="padding:0.6rem; font-size:0.65rem; width:100%;">SAVE EDITS</button>
                    <button class="btn btn-outline adm-del-btn" data-id="${p.id}" style="padding:0.6rem; font-size:0.65rem; width:100%; border-color:#fee2e2; color:#ef4444;">DELETE</button>
                </div>
            `;
            list.appendChild(row);
        });

        // Add save listeners
        document.querySelectorAll('.adm-save-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const row = btn.closest('.admin-product-item');
                const inputs = row.querySelectorAll('.adm-input');
                const p = products.find(x => x.id == id);
                inputs.forEach(input => {
                    const key = input.dataset.key;
                    p[key] = key === 'price' ? parseFloat(input.value) : input.value;
                });
                persistStore();
                renderProducts(); // Update front-end
                alert('Product information saved in this browser.');
            });
        });

        // Add delete listeners
        document.querySelectorAll('.adm-del-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if(confirm('Are you sure you want to remove this masterpiece?')) {
                    const id = btn.dataset.id;
                    products = products.filter(x => x.id != id);
                    persistStore();
                    renderAdminInventory();
                    renderProducts();
                }
            });
        });
    }

    function renderAdminOrders() {
        const list = document.getElementById('admin-order-list');
        document.getElementById('admin-order-badge').innerText = orders.length;
        list.innerHTML = '';
        orders.forEach(o => {
            const row = document.createElement('div');
            row.style = 'display:grid; grid-template-columns: 80px 1.5fr 1fr 100px 100px; padding:1rem; border-bottom:1px solid #eee; align-items:center; font-size:0.8rem;';
            row.innerHTML = `
                <span style="font-weight:700;">#${o.id}</span>
                <div style="line-height:1.2;">
                    <div style="font-weight:700;">${o.userName}</div>
                    <div style="font-size:0.65rem; color:var(--text-muted);">${o.userEmail}</div>
                </div>
                <div style="font-weight:700;">৳${Number(o.total).toLocaleString("en-BD")}</div>
                <span class="order-badge badge-${o.status.toLowerCase()}">${o.status}</span>
                <div>
                    ${o.status === 'Pending' ? `<button class="btn btn-primary adm-confirm-btn" data-id="${o.id}" style="padding:0.4rem 0.8rem; font-size:0.6rem;">CONFIRM</button>` : '<span style="color:#22c55e; font-size:0.6rem; font-weight:700;">ACTIONED</span>'}
                </div>
            `;
            list.appendChild(row);
        });

        document.querySelectorAll('.adm-confirm-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const o = orders.find(x => x.id == btn.dataset.id);
                if(o) {
                    const previous = o.status;
                    o.status = 'Confirmed';
                    o.updatedAt = new Date().toISOString();
                    addOrderHistory(o, previous, 'Confirmed');
                    renderAdminOrders();
                    renderClientDashboard();
                    alert(`Order #${o.id} confirmed successfully.`);
                }
            });
        });
    }

    // Event Handlers
    document.getElementById('admin-pass-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const key = document.getElementById('admin-pass-input').value;
        if (key === "sabbir+mahi") {
            document.getElementById('admin-login-view').style.display = 'none';
            document.getElementById('admin-dashboard-view').style.display = 'block';
            document.querySelector('.admin-sidebar').style.display = 'flex';
            renderAdminInventory();
            renderAdminOrders();
        } else {
            document.getElementById('admin-error').style.display = 'block';
        }
    });

    document.getElementById('add-new-product-btn').addEventListener('click', () => {
        const name = document.getElementById('new-p-name').value;
        const price = document.getElementById('new-p-price').value;
        const cat = document.getElementById('new-p-category').value;
        const img = document.getElementById('new-p-img').value || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=500';
        const metal = document.getElementById('new-p-metal').value;
        const weight = document.getElementById('new-p-weight').value;
        const stone = document.getElementById('new-p-stone').value;
        const desc = document.getElementById('new-p-desc').value || 'Exquisite masterpiece from our latest boutique collection.';

        if(name && price) {
            products.push({ 
                id: Date.now(), 
                name, 
                price: parseFloat(price), 
                category: cat,
                img, 
                metal, 
                weight, 
                stone, 
                desc 
            });
            persistStore();
            renderAdminInventory();
            renderProducts();
            
            // Clear fields
            ['new-p-name', 'new-p-price', 'new-p-img', 'new-p-metal', 'new-p-weight', 'new-p-stone', 'new-p-desc'].forEach(id => {
                document.getElementById(id).value = '';
            });
            alert('Product added successfully!');
        } else {
            alert('Please provide at least a name and a price.');
        }
    });

    document.getElementById('checkout-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if(!currentUser) {
            document.getElementById('auth-modal').classList.add('active');
            document.getElementById('auth-message-notice').style.display = 'block';
            return;
        }
        const total = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
        const orderId = Date.now();
        orders.push({
            id: orderId,
            userEmail: currentUser.email,
            userName: currentUser.name,
            total: total,
            status: 'Pending',
            itemsCount: cart.reduce((n, item) => n + item.quantity, 0),
            items: cart.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        addOrderHistory(orders[orders.length - 1], null, 'Pending', 'Client');
        persistStore();
        
        document.getElementById('order-id-display').innerText = `#ORD-${orderId}`;
        cart = [];
        window.mysvexCart = cart;
        updateCartUI();
        document.querySelector('.checkout-view').classList.remove('active');
        document.querySelector('.success-view').classList.add('active');
        document.querySelector('.cart-footer').style.display = 'none';
        renderClientDashboard();
        renderAdminOrders();
    });

    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('r-name').value.trim();
        const email = document.getElementById('r-email').value.trim().toLowerCase();
        const password = document.getElementById('r-pass').value;
        const errorBox = document.getElementById('auth-error-msg');
        if (users.some(u => u.email === email)) {
            errorBox.textContent = 'An account with this email already exists.';
            errorBox.style.display = 'block'; return;
        }
        // NOTE: local-only demo storage; passwords are not safe for a real public business site.
        users.push({ id: 'CL-' + Date.now().toString(36).toUpperCase(), name, email, password, createdAt: new Date().toISOString(), status: 'Active' });
        persistStore();
        currentUser = { name, email };
        document.getElementById('user-status-dot').style.display = 'block';
        document.getElementById('profile-display-name').innerText = currentUser.name;
        document.getElementById('profile-display-email').innerText = currentUser.email;
        document.getElementById('auth-modal').classList.remove('active');
        errorBox.style.display = 'none';
        renderClientDashboard(); updateCartUI();
        alert('Account created in this browser. This is not secure account authentication.');
    });

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('l-email').value.trim().toLowerCase();
        const password = document.getElementById('l-pass').value;
        const user = users.find(u => u.email === email && u.password === password);
        const errorBox = document.getElementById('auth-error-msg');
        if (!user) {
            errorBox.textContent = 'Account not found or password is incorrect. Register first.';
            errorBox.style.display = 'block'; return;
        }
        if (user.status === 'Disabled') {
            errorBox.textContent = 'This account is disabled. Please contact the business.';
            errorBox.style.display = 'block'; return;
        }
        currentUser = { email: user.email, name: user.name, id: user.id };
        document.getElementById('user-status-dot').style.display = 'block';
        document.getElementById('profile-display-name').innerText = currentUser.name;
        document.getElementById('profile-display-email').innerText = currentUser.email;
        document.getElementById('auth-modal').classList.remove('active');
        errorBox.style.display = 'none';
        renderClientDashboard(); updateCartUI();
    });

    document.getElementById('user-profile-btn').addEventListener('click', () => {
        if(currentUser) {
            renderClientDashboard();
            document.getElementById('profile-modal').classList.add('active');
        } else {
            document.getElementById('auth-modal').classList.add('active');
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        currentUser = null;
        document.getElementById('user-status-dot').style.display = 'none';
        document.getElementById('profile-modal').classList.remove('active');
        updateCartUI();
    });

    // Navigation and Toggles
    document.querySelector('.checkout-init-btn').addEventListener('click', () => {
        if(!currentUser) {
            document.getElementById('auth-modal').classList.add('active');
            document.getElementById('auth-message-notice').style.display = 'block';
            return;
        }
        if(cart.length === 0) {
            alert('Your collection is empty.');
            return;
        }
        document.querySelector('.cart-view').classList.remove('active');
        document.querySelector('.checkout-view').classList.add('active');
        document.querySelector('.cart-footer').style.display = 'none';
    });

    document.querySelector('.back-to-cart').addEventListener('click', () => {
        document.querySelector('.checkout-view').classList.remove('active');
        document.querySelector('.cart-view').classList.add('active');
        document.querySelector('.cart-footer').style.display = 'block';
    });

    document.querySelector('.close-after-success').addEventListener('click', () => {
        cartSidebar.classList.remove('open');
        overlay.classList.remove('active');
        setTimeout(() => {
            document.querySelector('.success-view').classList.remove('active');
            document.querySelector('.cart-view').classList.add('active');
            document.querySelector('.cart-footer').style.display = 'block';
        }, 500);
    });

    document.getElementById('admin-trigger').addEventListener('click', () => document.getElementById('admin-modal').classList.add('active'));
    document.querySelector('.cart-toggle').addEventListener('click', () => { cartSidebar.classList.add('open'); overlay.classList.add('active'); });
    document.querySelector('.cart-close').addEventListener('click', () => { cartSidebar.classList.remove('open'); overlay.classList.remove('active'); });
    document.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', () => document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'))));

    // Admin Sidebar Tabs
    document.querySelectorAll('.admin-nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
            const view = btn.dataset.view;
            document.getElementById(`admin-${view}-section`).classList.add('active');
            document.getElementById('admin-view-title').innerText = view === 'inventory' ? 'Inventory Management' : 'Order Requests';
        });
    });

    // Logout Admin
    document.getElementById('admin-logout').addEventListener('click', () => {
        document.getElementById('admin-login-view').style.display = 'block';
        document.getElementById('admin-dashboard-view').style.display = 'none';
        document.querySelector('.admin-sidebar').style.display = 'none';
        document.getElementById('admin-pass-input').value = '';
    });

    // Product search and category filters
    document.getElementById('product-search')?.addEventListener('input', () => {
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        renderProducts(activeFilter);
    });
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProducts(btn.dataset.filter);
        });
    });

    // Keep open tabs in sync when the local demo store changes in another tab.
    window.addEventListener('storage', (event) => {
        if (event.key !== 'mysvex_store_v1') return;
        try {
            const latest = JSON.parse(event.newValue || '{}');
            if (Array.isArray(latest.products)) products = latest.products;
            if (Array.isArray(latest.orders)) orders = latest.orders;
            if (Array.isArray(latest.users)) users = latest.users;
            if (Array.isArray(latest.orderHistory)) orderHistory = latest.orderHistory;
            renderProducts();
            renderAdminOrders();
            if (currentUser) renderClientDashboard();
        } catch (err) { console.warn('Could not refresh local data', err); }
    });

    // Initial Load
    renderProducts();
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) document.querySelector('.header').classList.add('scrolled');
    else document.querySelector('.header').classList.remove('scrolled');
});

// Mobile navigation and small-screen UX enhancements
document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (menuButton && navLinks) {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('mobile-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    });
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      menuButton.setAttribute('aria-expanded', 'false');
    }));
    document.addEventListener('click', event => {
      if (!navLinks.contains(event.target) && !menuButton.contains(event.target)) {
        navLinks.classList.remove('mobile-open');
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });
  }
});


// Mysvex auth tab switcher: explicitly reveal Login or Registration form.
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.auth-tab[data-tab]');
  const forms = document.querySelectorAll('.auth-form-content');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => {
        const active = t === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
      });
      forms.forEach(form => {
        const active = (target === 'login' && form.id === 'login-form') ||
                       (target === 'register' && form.id === 'register-form');
        form.classList.toggle('active', active);
        form.hidden = !active;
      });
      const err = document.getElementById('auth-error-msg');
      if (err) { err.style.display = 'none'; err.textContent = ''; }
    });
  });
  // Ensure the initial visible form matches the active tab.
  const activeTab = document.querySelector('.auth-tab.active') || tabs[0];
  if (activeTab) activeTab.click();
});
