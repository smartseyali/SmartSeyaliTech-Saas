
/**
 * Main application logic for the vanilla storefront
 */

const Storefront = {
    cart: [],
    tenant: null,

    /**
     * Initialize app
     */
    async init() {
        console.log("Initializing Storefront...");
        this.loadCart();

        // Try to get tenant slug from URL query
        const urlParams = new URLSearchParams(window.location.search);
        let slug = urlParams.get('tenant') || localStorage.getItem('last_tenant');

        if (!slug) {
            // Default to a fallback if none found
            slug = "default"; // You can change this to a real subdomain
        }

        const data = await window.API.setTenant(slug);
        if (data) {
            this.tenant = data;
            localStorage.setItem('last_tenant', slug);
            this.renderBrand(data);
        } else {
            console.error("No valid tenant found for slug:", slug);
        }

        this.updateCartBadge();
        this.bindEvents();
    },

    /**
     * Update UI with tenant brand settings
     */
    renderBrand(data) {
        document.title = data.name || "Modern Storefront";
        const logo = document.getElementById('store-logo');
        if (logo) logo.innerText = data.name;

        // Apply primary color
        if (data.primary_color) {
            document.documentElement.style.setProperty('--primary', data.primary_color);
        }
    },

    /**
     * Standardized cart management
     */
    loadCart() {
        const str = localStorage.getItem('store_cart');
        this.cart = str ? JSON.parse(str) : [];
    },

    saveCart() {
        localStorage.setItem('store_cart', JSON.stringify(this.cart));
        this.updateCartBadge();
    },

    addToCart(product, quantity = 1) {
        const existing = this.cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: Number(product.price || product.rate || 0),
                image_url: product.image_url,
                quantity: quantity
            });
        }
        this.saveCart();
        this.notify(`Added ${product.name} to cart`);
    },

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
    },

    updateQuantity(productId, newQty) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, newQty);
            this.saveCart();
        }
    },

    updateCartBadge() {
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            badge.innerText = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    },

    bindEvents() {
        // Universal event delegation for add-to-cart buttons
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.add-to-cart-btn');
            if (btn) {
                const id = btn.dataset.id;
                const name = btn.dataset.name;
                const price = btn.dataset.price;
                const image = btn.dataset.image;

                this.addToCart({ id, name, price, image_url: image });
            }
        });
    },

    notify(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce-in';
        toast.innerText = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    formatCurrency(val) {
        return "₹ " + Number(val || 0).toLocaleString();
    }
};

window.Storefront = Storefront;
document.addEventListener('DOMContentLoaded', () => window.Storefront.init());
