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
                .nav-cat-trigger     { padding:12px 16px; font-size:13px; font-weight:600; color:var(--text-muted); cursor:pointer; display:flex; align-items:center; gap:5px; border-bottom:2px solid transparent; transition:all .2s; user-select:none; }
                .nav-cat-trigger:hover,
                .nav-cat-wrap:hover .nav-cat-trigger { color:var(--primary); border-bottom-color:var(--primary); }
                .nav-cat-trigger svg { transition:transform .2s; }
                .nav-cat-wrap:hover .nav-cat-trigger svg { transform:rotate(180deg); }
                .nav-dropdown        { display:none; position:absolute; top:100%; left:0; min-width:220px; background:white; border-radius:0 0 12px 12px; box-shadow:0 8px 24px rgba(0,0,0,.12); z-index:999; padding:8px 0; border-top:2px solid var(--primary); }
                .nav-cat-wrap:hover .nav-dropdown { display:block; animation:fadeInDown .18s ease; }
                @keyframes fadeInDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
                .nav-dropdown a      { display:flex; align-items:center; gap:10px; padding:10px 18px; font-size:13px; font-weight:600; color:var(--text); transition:background .15s; white-space:nowrap; }
                .nav-dropdown a:hover { background:rgba(40,116,240,.06); color:var(--primary); }
                .nav-dropdown a img   { width:28px; height:28px; border-radius:50%; object-fit:cover; border:1px solid var(--border); }
                .nav-dropdown a .cat-dot { width:28px; height:28px; border-radius:50%; background:rgba(40,116,240,.12); display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
                .nav-dropdown .view-all { border-top:1px solid var(--bg); margin-top:4px; color:var(--primary) !important; font-weight:700 !important; }
            `;
            document.head.appendChild(style);
        }

        header.innerHTML = `
            <div class="container header-top">
                <div class="logo logo-container">
                    <a href="index.html"><h1 id="store-name">Store</h1></a>
                </div>
                <div class="search-container">
                    <input type="text" class="search-input" id="search-input" placeholder="Search for products...">
                    <button class="search-btn" onclick="doSearch()">Search</button>
                </div>
                <div class="header-actions">
                    <a href="profile.html" id="auth-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        Login
                    </a>
                    <a href="cart.html" id="cart-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        Cart <span class="cart-count" style="display:none">0</span>
                    </a>
                </div>
            </div>
            <nav class="nav-menu">
                <div class="container nav-links" id="mega-menu">
                    <a href="index.html">Home</a>
                    <a href="shop.html">All Products</a>
                    <!-- categories injected by renderNavCategories -->
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
        // Don't inject twice
        if (document.getElementById('main-footer')) return;

        const footer = document.createElement('footer');
        footer.id = 'main-footer';
        footer.innerHTML = `
            <div class="container">
                <div class="footer-grid">
                    <div class="footer-col">
                        <h4 id="footer-store-name">Store</h4>
                        <p id="footer-tagline" style="font-size:13px;color:#888;margin-top:8px;line-height:1.6">
                            Your one-stop shop for quality products.
                        </p>
                    </div>
                    <div class="footer-col">
                        <h4>Quick Links</h4>
                        <a href="index.html">Home</a>
                        <a href="shop.html">Shop</a>
                        <a href="profile.html">My Account</a>
                        <a href="order-tracking.html">Track Order</a>
                    </div>
                    <div class="footer-col">
                        <h4>Customer Care</h4>
                        <a href="#">Shipping Policy</a>
                        <a href="#">Return Policy</a>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>
                    <div class="footer-col">
                        <h4>Contact Us</h4>
                        <p id="footer-email" style="font-size:13px;color:#888">support@store.com</p>
                        <p id="footer-phone" style="font-size:13px;color:#888;margin-top:6px">+91 00000 00000</p>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p id="footer-copy">&copy; 2026 Store. All rights reserved.</p>
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

        if (!categories.length) {
            // No categories yet — keep Home + All Products
            return;
        }

        // Build dropdown list items
        const dropItems = categories.map(cat => {
            const thumb = cat.image_url
                ? `<img src="${cat.image_url}" alt="${cat.name}" onerror="this.style.display='none'">`
                : `<span class="cat-dot">🏷️</span>`;
            return `<a href="category.html?id=${cat.id}">${thumb} ${cat.name}</a>`;
        }).join('');

        // Insert Categories dropdown into nav
        megaMenu.innerHTML = `
            <a href="index.html">Home</a>
            <a href="shop.html">All Products</a>
            <a href="offer-zones.html">Offer Zones</a>
            <div class="nav-cat-wrap">
                <div class="nav-cat-trigger">
                    Categories
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <div class="nav-dropdown">
                    ${dropItems}
                    <a href="shop.html" class="view-all">📦 View All Products</a>
                </div>
            </div>
            ${categories.slice(0, 5).map(cat =>
            `<a href="category.html?id=${cat.id}">${cat.name}</a>`
        ).join('')}
        `;
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
