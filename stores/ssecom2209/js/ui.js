import api from './api.js';
import auth from './auth.js';
import { cartStore } from './cart.js';
import { mapper } from './mapper.js';

export const ui = {

    async init() {
        this.injectHeader();
        this.injectFooter();
        this.injectCartDrawer();

        try {
            const settings = await api.getSettings();
            this.applySettings(settings);
        } catch (e) { console.warn('Settings failed:', e.message); }

        try {
            await this.renderNavCategories();
        } catch (e) { console.warn('Nav Categories failed:', e.message); }

        // Auth-aware header link
        try {
            const user = await auth.getUser();
            const authLink = document.getElementById('auth-link');
            if (authLink && user) {
                const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Account';
                authLink.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${name}`;
                authLink.href = 'profile.html';
            }
        } catch (e) { }

        this.setupCartDrawer();
        this.updateCartBadge();
    },


    // ── Inject full header HTML ─────────────────────────────
    injectHeader() {
        const header = document.getElementById('main-header');
        if (!header) return;

        // Inject nav dropdown CSS once
        if (!document.getElementById('nav-dropdown-style')) {
            const style = document.createElement('style');
            style.id = 'nav-dropdown-style';
            style.textContent = `
                .nav-cat-wrap        { position:relative; }
                .nav-cat-trigger     { padding:8px 12px; font-size:14px; font-weight:700; color:white; cursor:pointer; display:flex; align-items:center; gap:5px; border:1px solid transparent; transition:all .2s; user-select:none; }
                .nav-cat-trigger:hover,
                .nav-cat-wrap:hover .nav-cat-trigger { border-color:white; }
                
                /* THE DROPDOWN */
                .nav-dropdown        { display:none; position:absolute; top:100%; left:0; min-width:240px; background:white; z-index:1000; padding:10px 0; border:1px solid #ddd; box-shadow:0 4px 12px rgba(0,0,0,.1); }
                
                /* Bridge */
                .nav-dropdown::before { content:''; position:absolute; top:-10px; left:0; right:0; height:10px; }
                
                .nav-cat-wrap:hover .nav-dropdown { display:block; }
                
                .nav-dropdown a      { display:block; padding:10px 20px; font-size:13px; color:#111; font-weight:500; transition:background .15s; }
                .nav-dropdown a:hover { background:#f3f3f3; text-decoration:underline; }
                .nav-dropdown .view-all { border-top:1px solid #eee; margin-top:5px; font-weight:700; color: #007185; }
                
                .top-cat-link { color:white !important; padding:8px 12px !important; border:1px solid transparent; font-weight:500 !important; }
                .top-cat-link:hover { border-color:white; }
            `;
            document.head.appendChild(style);
        }

        header.innerHTML = `
            <div class="container header-top" style="height:60px">
                <div class="logo logo-container">
                    <a href="index.html" style="border:1px solid transparent; padding:4px 8px; border-radius:2px; display:inline-block; transition:all .2s; margin-left:-8px;" onmouseover="this.style.borderColor='white'" onmouseout="this.style.borderColor='transparent'">
                        <h1 id="store-name" style="color:white; font-size:20px; font-weight:800;">Grand Bazaar</h1>
                    </a>
                </div>
                <div class="search-container" style="max-width:none; height:40px; border-radius:4px; overflow:hidden; background:white; display:flex; flex:1; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="background:#f3f3f3; padding:0 12px; border-right:1px solid #ddd; display:flex; align-items:center; font-size:12px; color:#555; cursor:pointer;">All</div>
                    <input type="text" class="search-input" id="search-input" placeholder="Search Grand Bazaar" style="border:none; height:100%; border-radius:0;">
                    <button class="search-btn" onclick="doSearch()" style="background:var(--accent); color:#333; height:100%; padding:0 15px; border-radius:0;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </button>
                </div>
                <div class="header-actions" style="gap:5px;">
                    <a href="profile.html" id="auth-link" style="border:1px solid transparent; padding:8px 10px; border-radius:2px; display:flex; flex-direction:column; align-items:flex-start; gap:0;">
                        <span style="font-size:11px; font-weight:400; opacity:0.8;">Hello, Sign in</span>
                        <span style="font-size:14px; font-weight:700; margin-top:-2px;">Account & Lists</span>
                    </a>
                    <a href="order-tracking.html" style="border:1px solid transparent; padding:8px 10px; border-radius:2px; display:flex; flex-direction:column; align-items:flex-start; gap:0;">
                        <span style="font-size:11px; font-weight:400; opacity:0.8;">Returns</span>
                        <span style="font-size:14px; font-weight:700; margin-top:-2px;">& Orders</span>
                    </a>
                    <a href="cart.html" id="cart-btn" style="border:1px solid transparent; padding:8px 10px; border-radius:2px; position:relative; display:flex; align-items:flex-end; gap:5px;">
                        <div style="position:relative;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                            <span class="cart-count" style="display:none; color:#f08804; font-size:16px; top:-5px; left:12px; width:100%; text-align:center;">0</span>
                        </div>
                        <span style="font-size:14px; font-weight:700;">Cart</span>
                    </a>
                </div>
            </div>
            <nav class="nav-menu" style="background:#232f3e; border-bottom:none; height:40px; display:flex; align-items:center;">
                <div class="container nav-links" id="mega-menu" style="display:flex; align-items:center; height:100%; padding:0 15px;">
                    <a href="index.html" class="top-cat-link">Home</a>
                    <a href="shop.html" class="top-cat-link">All Products</a>
                </div>
            </nav>
        `;

        // Search handler
        window.doSearch = () => {
            const q = document.getElementById('search-input')?.value.trim();
            if (q) window.location.href = `shop.html?search=${encodeURIComponent(q)}`;
        };
        document.getElementById('search-input')?.addEventListener('keydown', e => {
            if (e.key === 'Enter') window.doSearch();
        });
    },

    // ── Inject cart drawer HTML ─────────────────────────────
    injectCartDrawer() {
        // Only inject if placeholder exists and is empty
        let drawer = document.getElementById('cart-drawer');
        if (!drawer) {
            drawer = document.createElement('div');
            drawer.id = 'cart-drawer';
            drawer.className = 'drawer';
            document.body.appendChild(drawer);
        }
        if (!drawer.innerHTML.trim()) {
            drawer.innerHTML = `
                <div class="drawer-header">
                    <h3>My Cart</h3>
                    <button id="close-cart">&times;</button>
                </div>
                <div id="cart-items-container" class="drawer-content"></div>
                <div class="drawer-footer">
                    <div class="total-row">
                        <span>Total</span>
                        <span id="cart-drawer-total">₹0</span>
                    </div>
                    <a href="checkout.html" class="btn btn-primary" style="width:100%;text-align:center;display:block">
                        Proceed to Checkout
                    </a>
                </div>
            `;
        }

        // Overlay
        let overlay = document.getElementById('drawer-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'drawer-overlay';
            overlay.className = 'drawer-overlay';
            document.body.appendChild(overlay);
        }
        overlay.onclick = () => {
            drawer.classList.remove('open');
            overlay.classList.remove('show');
        };
    },

    // ── Inject footer HTML ──────────────────────────────────
    injectFooter() {
        if (document.getElementById('main-footer')) return;

        // Amazon Back to Top
        const backToTop = document.createElement('div');
        backToTop.innerHTML = `<div style="background:#37475a; color:white; text-align:center; padding:15px; font-size:13px; cursor:pointer;" onclick="window.scrollTo({top:0, behavior:'smooth'})">Back to top</div>`;
        document.body.appendChild(backToTop);

        const footer = document.createElement('footer');
        footer.id = 'main-footer';
        footer.style.background = '#232f3e';
        footer.style.color = 'white';
        footer.style.padding = '40px 0 60px';
        footer.innerHTML = `
            <div class="container" style="max-width:1000px">
                <div class="footer-grid" style="grid-template-columns: repeat(4, 1fr); gap:60px">
                    <div class="footer-col">
                        <h4 style="color:white; font-size:16px; margin-bottom:15px">Get to Know Us</h4>
                        <a href="#" style="color:#ddd; font-size:14px">About Grand Bazaar</a>
                        <a href="#" style="color:#ddd; font-size:14px">Careers</a>
                        <a href="#" style="color:#ddd; font-size:14px">Press Releases</a>
                    </div>
                    <div class="footer-col">
                        <h4>Connect with Us</h4>
                        <a href="#">Facebook</a>
                        <a href="#">Twitter</a>
                        <a href="#">Instagram</a>
                    </div>
                    <div class="footer-col">
                        <h4>Make Money with Us</h4>
                        <a href="#">Sell on Grand Bazaar</a>
                        <a href="#">Become an Affiliate</a>
                        <a href="#">Protect and Build Your Brand</a>
                    </div>
                    <div class="footer-col">
                        <h4>Let Us Help You</h4>
                        <a href="profile.html">Your Account</a>
                        <a href="order-tracking.html">Returns Centre</a>
                        <a href="#">Help</a>
                    </div>
                </div>
                <div style="border-top:1px solid #3a4553; margin-top:40px; padding-top:30px; text-align:center;">
                    <h2 style="font-size:18px; font-weight:800; color:white;">Grand Bazaar</h2>
                    <p style="font-size:12px; color:#ddd; margin-top:10px">&copy; 2026 Grand Bazaar. Developed for EcomSuite Merchant.</p>
                </div>
            </div>
        `;
        document.body.appendChild(footer);
    },

    // ── Apply store settings to header + footer ─────────────
    applySettings(settings) {
        if (!settings || !Object.keys(settings).length) return;

        // CSS variable
        if (settings.primary_color) {
            document.documentElement.style.setProperty('--primary', settings.primary_color);
        }

        // Browser tab title
        if (settings.store_name) document.title = `${document.title} | ${settings.store_name}`;

        // Header store name / logo
        const nameEl = document.getElementById('store-name');
        if (nameEl) {
            nameEl.textContent = settings.store_name || 'Store';
        }
        if (settings.logo_url) {
            const logoContainer = document.querySelector('.logo-container');
            if (logoContainer) {
                logoContainer.innerHTML = `<a href="index.html"><img src="${settings.logo_url}" alt="${settings.store_name}" style="height:40px;object-fit:contain"></a>`;
            }
        }

        // Footer
        const footerName = document.getElementById('footer-store-name');
        const footerCopy = document.getElementById('footer-copy');
        const footerEmail = document.getElementById('footer-email');
        const footerTag = document.getElementById('footer-tagline');
        if (footerName) footerName.textContent = settings.store_name || 'Store';
        if (footerCopy) footerCopy.textContent = `© ${new Date().getFullYear()} ${settings.store_name || 'Store'}. All rights reserved.`;
        if (footerEmail && settings.config?.contact_email) footerEmail.textContent = settings.config.contact_email;
        if (footerTag && settings.store_tagline) footerTag.textContent = settings.store_tagline;
    },

    // ── Load categories into nav with dropdown ───────────────
    async renderNavCategories() {
        const categories = await api.getCategories();
        const megaMenu = document.getElementById('mega-menu');
        if (!megaMenu) return;

        // Clear existing injected content but keep standard links
        megaMenu.innerHTML = `
            <a href="index.html">Home</a>
            <a href="shop.html">All Products</a>
            <a href="offer-zones.html">Offer Zones</a>
        `;

        if (!categories.length) return;

        // Build dropdown list items
        const dropItems = categories.map(cat => {
            const thumb = cat.image_url
                ? `<img src="${cat.image_url}" alt="${cat.name}" onerror="this.outerHTML='<span class=cat-dot>🏷️</span>'">`
                : `<span class="cat-dot">🏷️</span>`;
            return `<a href="category.html?id=${cat.id}">${thumb} ${cat.name}</a>`;
        }).join('');

        // Insert Categories dropdown into nav
        const dropdownHtml = `
            <div class="nav-cat-wrap" id="nav-cat-wrap">
                <div class="nav-cat-trigger">
                    Shop by Category
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <div class="nav-dropdown">
                    ${dropItems}
                    <a href="shop.html" class="view-all">📦 View All Products</a>
                </div>
            </div>
            ${categories.slice(0, 4).map(cat =>
            `<a href="category.html?id=${cat.id}" class="top-cat-link">${cat.name}</a>`
        ).join('')}
        `;

        megaMenu.insertAdjacentHTML('beforeend', dropdownHtml);
    },

    // ── Cart drawer setup ───────────────────────────────────
    setupCartDrawer() {
        const cartBtn = document.getElementById('cart-btn');
        const drawer = document.getElementById('cart-drawer');
        const overlay = document.getElementById('drawer-overlay');
        const closeBtn = document.getElementById('close-cart');

        if (cartBtn && drawer) {
            cartBtn.addEventListener('click', e => {
                e.preventDefault();
                drawer.classList.add('open');
                if (overlay) overlay.classList.add('show');
                this.renderCartItems();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                drawer.classList.remove('open');
                if (overlay) overlay.classList.remove('show');
            });
        }

        window.addEventListener('cart-updated', () => {
            this.updateCartBadge();
            if (drawer?.classList.contains('open')) this.renderCartItems();
        });
    },

    // ── Cart badge count ────────────────────────────────────
    updateCartBadge() {
        const badges = document.querySelectorAll('.cart-count');
        const count = cartStore.get().reduce((s, i) => s + i.quantity, 0);
        badges.forEach(b => {
            b.textContent = count;
            b.style.display = count > 0 ? 'inline-flex' : 'none';
        });
    },

    // ── Render cart items in drawer ─────────────────────────
    renderCartItems() {
        const container = document.getElementById('cart-items-container');
        const totalEl = document.getElementById('cart-drawer-total');
        if (!container) return;

        const cart = cartStore.get();
        if (!cart.length) {
            container.innerHTML = `
                <div style="text-align:center;padding:48px 0;color:var(--text-muted)">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 12px;display:block;opacity:.3"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    <p style="font-weight:700">Your cart is empty</p>
                    <a href="shop.html" style="color:var(--primary);font-size:13px;font-weight:600;margin-top:8px;display:block">Browse Products →</a>
                </div>`;
            if (totalEl) totalEl.textContent = '₹0';
            return;
        }

        container.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image || ''}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60'">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${mapper.formatCurrency(item.price)}</div>
                    <div class="cart-item-qty">Qty: ${item.quantity}</div>
                </div>
                <button onclick="window.removeFromCart('${item.product_id}', '${item.variant_id}')"
                    style="border:none;background:none;cursor:pointer;color:var(--text-muted);font-size:18px;padding:4px">&times;</button>
            </div>
        `).join('');

        const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
        if (totalEl) totalEl.textContent = mapper.formatCurrency(total);
    }
};

window.removeFromCart = (pid, vid) => cartStore.removeItem(pid, vid);

export default ui;
