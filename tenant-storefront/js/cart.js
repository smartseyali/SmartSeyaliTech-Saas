
/**
 * Professional Cart Management Logic
 */

(function () {
    if (window.CartPageInstance) return;

    window.CartPageInstance = {
        async init() {
            console.log("🛠️ Initializing Secure Cart Review...");
            this.render();
        },

        render() {
            const cart = window.StorefrontInstance.cart || [];
            const container = document.getElementById('cart-list');
            const subtotalEl = document.getElementById('subtotal');
            const totalEl = document.getElementById('total');

            if (!container) return;

            if (cart.length === 0) {
                container.innerHTML = `
                    <div class="card p-20 text-center flex flex-col items-center gap-6" style="border: 2px dashed var(--slate-100);">
                        <div class="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center">
                            <i data-lucide="shopping-bag" style="width: 32px; height: 32px;"></i>
                        </div>
                        <h2 class="text-2xl font-black text-slate-900">Your bag is currently empty</h2>
                        <p class="section-subtitle">Discover our premium organic selections and start building your collection.</p>
                        <a href="shop.html" class="btn btn-primary px-10 h-14 mt-4">Discover Products</a>
                    </div>
                `;
                if (subtotalEl) subtotalEl.innerText = "₹ 0.00";
                if (totalEl) totalEl.innerText = "₹ 0.00";
                if (window.lucide) lucide.createIcons();
                return;
            }

            container.innerHTML = cart.map(item => `
                <div class="card flex flex-col md:flex-row items-center gap-8 p-6 card-hover" style="border-radius: 24px;">
                    <div style="width: 140px; height: 140px; border-radius: 20px; overflow: hidden; background: var(--slate-50);">
                        <img src="${item.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'}" 
                             style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>
                    
                    <div class="flex-1 space-y-2">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="text-lg font-black text-slate-900">${item.name}</h3>
                                <p class="label" style="text-transform: none; color: var(--slate-400); margin-top: 2px;">Premium Quality Certified</p>
                            </div>
                            <p class="text-xl font-black text-primary">${window.StorefrontInstance.formatCurrency(item.price)}</p>
                        </div>
                        
                        <div class="flex items-center justify-between pt-4">
                            <div class="flex items-center gap-4 p-1 bg-slate-100/50 rounded-xl border border-slate-100 w-fit">
                                <button class="btn btn-ghost" style="padding: 6px; border-radius: 8px;" onclick="window.CartPageInstance.updateQty('${item.id}', ${item.quantity - 1})">
                                    <i data-lucide="minus" style="width:14px; height:14px;"></i>
                                </button>
                                <span class="font-black px-2 text-sm text-slate-700">${item.quantity}</span>
                                <button class="btn btn-ghost" style="padding: 6px; border-radius: 8px;" onclick="window.CartPageInstance.updateQty('${item.id}', ${item.quantity + 1})">
                                    <i data-lucide="plus" style="width:14px; height:14px;"></i>
                                </button>
                            </div>
                            
                            <button class="btn btn-ghost" style="color: var(--slate-300); padding: 8px;" onclick="window.CartPageInstance.remove('${item.id}')">
                                <i data-lucide="trash-2" style="width:18px; height:18px;"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            if (subtotalEl) subtotalEl.innerText = window.StorefrontInstance.formatCurrency(subtotal);
            if (totalEl) totalEl.innerText = window.StorefrontInstance.formatCurrency(subtotal);

            if (window.lucide) lucide.createIcons();
        },

        updateQty(id, qty) {
            window.StorefrontInstance.updateQuantity(id, qty);
            this.render();
        },

        remove(id) {
            window.StorefrontInstance.removeFromCart(id);
            this.render();
        }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => window.CartPageInstance.init());
    else window.CartPageInstance.init();
})();
