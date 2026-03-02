
/**
 * Professional Storefront Engine
 * Handles branding, cart, and global UI state
 */

(function () {
    if (window.StorefrontInstance) return;

    window.StorefrontInstance = {
        cart: [],
        tenant: null,
        _initialized: false,

        async init() {
            if (this._initialized) return;
            this._initialized = true;

            console.log("💎 Storefront Engine Active...");
            this.loadCart();

            // Hardcoded tenant for this instance
            const slug = "tech-cipher"; // __TENANT_SLUG__

            if (window.API) {
                const data = await window.API.setTenant(slug);
                if (data) {
                    this.tenant = data;
                    this.applyBranding(data);
                }
            }

            this.syncCartUI();
            this.bindGlobalEvents();
        },

        applyBranding(data) {
            document.title = `${data.name || 'CIPHER.SYS'} | Next Gen Tech`;
            const logos = document.querySelectorAll('#store-logo, #footer-logo');
            logos.forEach(el => el.innerText = (data.name || 'STORE').toUpperCase());

            if (data.primary_color) {
                document.documentElement.style.setProperty('--acc-500', data.primary_color);
            }
        },

        loadCart() {
            const str = localStorage.getItem('store_cart_v2');
            this.cart = str ? JSON.parse(str) : [];
        },

        saveCart() {
            localStorage.setItem('store_cart_v2', JSON.stringify(this.cart));
            this.syncCartUI();
        },

        addToCart(product, qty = 1) {
            const existing = this.cart.find(i => i.id === product.id);
            if (existing) {
                existing.quantity += qty;
            } else {
                this.cart.push({ ...product, quantity: qty });
            }
            this.saveCart();
            this.pushNotification(`${product.name} DATA ARCHIVED.`);
        },

        removeFromCart(id) {
            this.cart = this.cart.filter(i => i.id !== id);
            this.saveCart();
        },

        updateQuantity(id, qty) {
            const item = this.cart.find(i => i.id === id);
            if (item) {
                item.quantity = Math.max(1, qty);
                this.saveCart();
            }
        },

        syncCartUI() {
            const counters = document.querySelectorAll('#cart-counter');
            const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            counters.forEach(el => {
                el.innerText = count;
                el.style.display = count > 0 ? 'flex' : 'none';
            });
        },

        pushNotification(message) {
            const toast = document.createElement('div');
            toast.className = 'animate-reveal';
            toast.style = `
                position: fixed; bottom: 40px; right: 40px; 
                background: var(--s-950); color: white; 
                padding: 1.25rem 2.5rem; border-radius: var(--radius-md);
                font-weight: 800; font-size: 0.9rem; z-index: 9999;
                box-shadow: var(--shadow-float); border: 1px solid rgba(255,255,255,0.1);
            `;
            toast.innerText = message;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(20px)';
                toast.style.transition = 'all 0.6s var(--ease-soft)';
                setTimeout(() => toast.remove(), 600);
            }, 3000);
        },

        formatCurrency(val) {
            return "₹ " + Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
        },

        bindGlobalEvents() {
            // Scroll Logic
            window.addEventListener('scroll', () => {
                const header = document.getElementById('main-header');
                if (header) {
                    if (window.scrollY > 80) header.classList.add('scrolled');
                    else header.classList.remove('scrolled');
                }
            });
        }
    };

    /** Bootstrap **/
    async function bootstrap() {
        let retries = 0;
        while (!window.API && retries < 40) {
            await new Promise(r => setTimeout(r, 100));
            retries++;
        }
        if (window.StorefrontInstance) await window.StorefrontInstance.init();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootstrap);
    else bootstrap();
})();
