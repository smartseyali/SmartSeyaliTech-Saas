
/**
 * Cart page specific logic
 */

const CartPage = {
    async init() {
        console.log("Initializing Cart Details...");
        this.renderCart();
    },

    renderCart() {
        const cart = window.Storefront.cart;
        const list = document.getElementById('cart-list');
        const subtotalEl = document.getElementById('subtotal');
        const totalEl = document.getElementById('total');

        if (!list) return;

        if (cart.length === 0) {
            list.innerHTML = `
                <div class="py-20 text-center flex flex-col items-center gap-6">
                    <div class="p-8 bg-slate-50 text-slate-300 rounded-full w-24 h-24 flex items-center justify-center">
                        <i data-lucide="shopping-bag" class="w-12 h-12"></i>
                    </div>
                    <h2 class="text-2xl font-black text-slate-400">Your bag is empty</h2>
                    <p class="text-slate-400 mt-2">Looks like you haven't added anything yet.</p>
                    <a href="shop.html" class="btn btn-primary px-10 h-14 mt-6">Continue Shopping</a>
                </div>
            `;
            if (subtotalEl) subtotalEl.innerText = "₹ 0.00";
            if (totalEl) totalEl.innerText = "₹ 0.00";
            return;
        }

        list.innerHTML = cart.map(item => `
            <div class="cart-item border-b border-slate-50 py-8 grid" style="grid-template-columns: 120px 1fr auto; gap: 2.5rem; align-items: center;">
                <img src="${item.image_url || 'https://api.iconify.design/lucide:package.svg'}" class="w-[124px] h-[124px] rounded-3xl object-cover bg-slate-50" />
                <div class="flex flex-col gap-2">
                    <h3 class="text-lg font-bold text-slate-800">${item.name}</h3>
                    <div class="text-primary font-black text-xl">${window.Storefront.formatCurrency(item.price)}</div>
                    
                    <div class="flex items-center gap-4 mt-4 p-1.5 bg-slate-50 rounded-xl border border-slate-100 w-fit">
                        <button class="p-2 hover:bg-white rounded-lg transition-all" onclick="window.CartPage.updateQty('${item.id}', ${item.quantity - 1})">
                            <i data-lucide="minus" class="w-3 h-3"></i>
                        </button>
                        <span class="font-bold px-3 text-sm">${item.quantity}</span>
                        <button class="p-2 hover:bg-white rounded-lg transition-all" onclick="window.CartPage.updateQty('${item.id}', ${item.quantity + 1})">
                            <i data-lucide="plus" class="w-3 h-3"></i>
                        </button>
                    </div>
                </div>
                <button class="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl" onclick="window.CartPage.removeItem('${item.id}')">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `).join('');

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (subtotalEl) subtotalEl.innerText = window.Storefront.formatCurrency(subtotal);
        if (totalEl) totalEl.innerText = window.Storefront.formatCurrency(subtotal);

        // Re-init icons
        if (window.lucide) lucide.createIcons();
    },

    updateQty(id, qty) {
        window.Storefront.updateQuantity(id, qty);
        this.renderCart();
    },

    removeItem(id) {
        window.Storefront.removeFromCart(id);
        this.renderCart();
    }
};

window.CartPage = CartPage;
document.addEventListener('DOMContentLoaded', () => CartPage.init());
