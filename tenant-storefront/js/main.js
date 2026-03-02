
/**
 * Global Storefront Architecture - Universal Main Script
 */

(function () {
    if (window.StorefrontInstance) return;

    window.StorefrontInstance = {
        cart: [],
        tenant: null,

        async init() {
            if (this._initialized) return;
            this._initialized = true;

            console.log("🛠️ Storefront Core Initialized.");
            this.loadCart();

            // Resolve Tenant Metadata
            if (window.API) {
                // Try to get slug from directory path if /stores/SLUG/ or from URL
                let slug = new URLSearchParams(window.location.search).get('tenant') ||
                    window.location.pathname.split('/stores/')[1]?.split('/')[0] ||
                    localStorage.getItem('active_tenant') || "default";

                const data = await window.API.setTenant(slug);
                if (data) {
                    this.tenant = data;
                    localStorage.setItem('active_tenant', slug);
                    this.applyBranding(data);
                }
            }

            this.syncUIState();
            this.bindCoreEvents();
        },

        applyBranding(data) {
            document.title = `${data.name || 'Store'} | Premium Organic`;
            const logos = document.querySelectorAll('#store-logo');
            logos.forEach(l => l.innerText = data.name || 'STORE');

            if (data.primary_color) {
                document.documentElement.style.setProperty('--primary', data.primary_color);
                // Compute RGB for transparency
                try {
                    const hex = data.primary_color.replace('#', '');
                    const r = parseInt(hex.substring(0, 2), 16);
                    const g = parseInt(hex.substring(2, 4), 16);
                    const b = parseInt(hex.substring(4, 6), 16);
                    document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
                } catch (e) { }
            }
        },

        loadCart() {
            try {
                const stored = localStorage.getItem('store_cart_v2');
                this.cart = stored ? JSON.parse(stored) : [];
            } catch (e) { this.cart = []; }
        },

        saveCart() {
            localStorage.setItem('store_cart_v2', JSON.stringify(this.cart));
            this.syncUIState();
        },

        addToCart(product, qty = 1) {
            const existing = this.cart.find(i => i.id === product.id);
            if (existing) {
                existing.quantity += qty;
            } else {
                this.cart.push({ ...product, quantity: qty });
            }
            this.saveCart();
            this.pushNotification(`${product.name} secure added to cart.`);
        },

        syncUIState() {
            // Update Cart Counters
            const counters = document.querySelectorAll('#cart-counter, .cart-badge');
            const totalItems = this.cart.reduce((s, i) => s + i.quantity, 0);
            counters.forEach(c => {
                c.innerText = totalItems;
                c.style.display = totalItems > 0 ? 'flex' : 'none';
            });

            // Update Auth Navigation
            this.renderAuthStatus();
        },

        async renderAuthStatus() {
            const user = await window.API?.getUser();
            const headerActions = document.querySelector('header .flex.items-center:last-child');
            if (!headerActions) return;

            // Simple check: do we have a login link?
            let authLink = headerActions.querySelector('.auth-trigger');
            if (!authLink) {
                const link = document.createElement('a');
                link.className = 'nav-link auth-trigger';
                headerActions.prepend(link);
                authLink = link;
            }

            if (user) {
                authLink.href = 'profile.html';
                authLink.innerHTML = `<i data-lucide="user-check" style="width:20px; height:20px; color:var(--primary);"></i>`;
            } else {
                authLink.href = 'login.html';
                authLink.innerHTML = `<i data-lucide="user" style="width:20px; height:20px;"></i>`;
            }

            if (window.lucide) lucide.createIcons();
        },

        bindCoreEvents() {
            // Global add to cart listener
            document.addEventListener('click', (e) => {
                const btn = e.target.closest('.add-to-cart-btn');
                if (btn) {
                    const { id, name, price, image } = btn.dataset;
                    this.addToCart({ id, name, price: Number(price), image_url: image });
                }
            });
        },

        pushNotification(msg) {
            const el = document.createElement('div');
            el.className = 'animate-reveal';
            el.style = `
                position: fixed; bottom: 32px; right: 32px; 
                background: var(--slate-900); color: white; 
                padding: 1.25rem 2rem; border-radius: 20px; 
                box-shadow: var(--shadow-xl); z-index: 9999;
                font-weight: 700; font-size: 0.9rem;
                display: flex; align-items: center; gap: 1rem;
            `;
            el.innerHTML = `<i data-lucide="check-circle" style="color:var(--primary);"></i> ${msg}`;
            document.body.appendChild(el);
            if (window.lucide) lucide.createIcons();

            setTimeout(() => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(10px)';
                el.style.transition = 'all 0.5s ease';
                setTimeout(() => el.remove(), 500);
            }, 3000);
        },

        formatCurrency(val) {
            return "₹ " + Number(val || 0).toLocaleString();
        }
    };

    // Auto-boot sequence
    async function boot() {
        let retries = 0;
        while (!window.API && retries < 40) {
            await new Promise(r => setTimeout(r, 100));
            retries++;
        }
        if (window.StorefrontInstance) await window.StorefrontInstance.init();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
