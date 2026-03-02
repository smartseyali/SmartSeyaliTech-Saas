
/**
 * Professional Cart Display Logic
 */

(function () {
    if (window.CartExperience) return;

    window.CartExperience = {
        async init() {
            console.log("🛒 Synching Cart Experience...");

            // Wait for Engine
            let tries = 0;
            while (!window.StorefrontInstance && tries < 40) {
                await new Promise(r => setTimeout(r, 100));
                tries++;
            }

            this.render();
        },

        render() {
            const feed = document.getElementById('cart-items-feed');
            const subtotalEl = document.getElementById('cart-subtotal');
            const totalEl = document.getElementById('cart-total');
            if (!feed) return;

            const cart = window.StorefrontInstance.cart;

            if (cart.length === 0) {
                feed.innerHTML = `
                    <div class="card p-20 text-center animate-reveal" style="border-radius: var(--radius-xl);">
                        <div class="w-24 h-24 bg-s-50 mx-auto flex items-center justify-center rounded-3xl text-s-300 mb-8">
                             <i data-lucide="shopping-bag" style="width: 32px; height: 32px;"></i>
                        </div>
                        <h3 class="text-3xl font-black text-s-950 mb-4">Archive Empty.</h3>
                        <p class="label" style="text-transform: none; margin-bottom: 3rem;">Your refined selection is currently void of items.</p>
                        <a href="shop.html" class="btn btn-primary">Discover Selections</a>
                    </div>
                `;
                if (window.lucide) lucide.createIcons();
                subtotalEl.innerText = "₹ 0.00";
                totalEl.innerText = "₹ 0.00";
                return;
            }

            feed.innerHTML = cart.map(item => `
                <article class="card p-8 flex items-center gap-10 card-hover animate-reveal" style="border-radius: var(--radius-xl);">
                    <div class="w-32 h-32 bg-s-50 rounded-3xl overflow-hidden border border-s-100 flex-shrink-0">
                        <img src="${item.image_url}" class="w-full h-full object-cover" />
                    </div>
                    <div class="flex-1 space-y-2">
                        <h4 class="text-2xl font-black text-s-950">${item.name}</h4>
                        <p class="label" style="text-transform: none; color: var(--p-900);">${window.StorefrontInstance.formatCurrency(item.price)} per unit</p>
                    </div>
                    <div class="flex items-center gap-6 p-2 bg-s-50 rounded-2xl border border-s-100 shadow-inner">
                        <button onclick="window.CartExperience.changeQty('${item.id}', -1)" class="btn btn-ghost" style="width:44px; height:44px; border-radius:12px; padding:0;"><i data-lucide="minus" style="width:16px;"></i></button>
                        <span class="text-lg font-black px-4 min-w-[30px] text-center">${item.quantity}</span>
                        <button onclick="window.CartExperience.changeQty('${item.id}', 1)" class="btn btn-ghost" style="width:44px; height:44px; border-radius:12px; padding:0;"><i data-lucide="plus" style="width:16px;"></i></button>
                    </div>
                    <div class="text-right min-w-[150px]">
                         <p class="text-2xl font-black text-p-900">${window.StorefrontInstance.formatCurrency(item.price * item.quantity)}</p>
                         <button onclick="window.CartExperience.remove('${item.id}')" class="label mt-2" style="color: var(--s-400); cursor:pointer; background:none; border:none; text-transform: none; opacity: 0.6;">Delete</button>
                    </div>
                </article>
            `).join('');

            const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
            subtotalEl.innerText = window.StorefrontInstance.formatCurrency(total);
            totalEl.innerText = window.StorefrontInstance.formatCurrency(total);
            if (window.lucide) lucide.createIcons();
        },

        changeQty(id, delta) {
            const item = window.StorefrontInstance.cart.find(i => i.id === id);
            if (item) {
                window.StorefrontInstance.updateQuantity(id, item.quantity + delta);
                this.render();
            }
        },

        remove(id) {
            window.StorefrontInstance.removeFromCart(id);
            this.render();
        }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => window.CartExperience.init());
    else window.CartExperience.init();
})();
