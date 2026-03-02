
/**
 * Professional Checkout Logic
 */

(function () {
    if (window.CheckoutExperience) return;

    window.CheckoutExperience = {
        user: null,

        async init() {
            console.log("🏙️ Synching Checkout Intelligence...");

            // Wait for Engine
            let tries = 0;
            while (!window.StorefrontInstance && tries < 40) {
                await new Promise(r => setTimeout(r, 100));
                tries++;
            }

            if (!window.StorefrontInstance) return;

            // Auth Restriction
            this.user = await window.API.getUser();
            if (!this.user) {
                window.StorefrontInstance.pushNotification("Authentication required for checkout.");
                setTimeout(() => location.href = 'login.html', 1500);
                return;
            }

            this.render();
            this.bindEvents();
        },

        render() {
            const list = document.getElementById('checkout-items-list');
            const subtotalEl = document.getElementById('checkout-subtotal');
            const totalEl = document.getElementById('checkout-total');
            if (!list) return;

            const cart = window.StorefrontInstance.cart;
            if (cart.length === 0) {
                location.href = 'cart.html';
                return;
            }

            list.innerHTML = cart.map(item => `
                <div class="flex justify-between items-center py-4">
                    <div class="flex items-center gap-4">
                        <span class="label" style="background:var(--s-50); color:var(--s-500); width:24px; height:24px; display:flex; align-items:center; justify-content:center; border-radius:50%; font-size:10px;">${item.quantity}</span>
                        <p class="text-sm font-bold text-s-900">${item.name}</p>
                    </div>
                    <p class="text-sm font-black text-s-950">${window.StorefrontInstance.formatCurrency(item.price * item.quantity)}</p>
                </div>
            `).join('');

            const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
            subtotalEl.innerText = window.StorefrontInstance.formatCurrency(total);
            totalEl.innerText = window.StorefrontInstance.formatCurrency(total);
        },

        async bindEvents() {
            const btn = document.getElementById('place-order-btn');
            if (!btn) return;

            btn.onclick = async () => {
                const firstName = document.getElementById('ship-first-name').value;
                const lastName = document.getElementById('ship-last-name').value;
                const address = document.getElementById('ship-address').value;
                const city = document.getElementById('ship-city').value;
                const pincode = document.getElementById('ship-pincode').value;
                const phone = document.getElementById('ship-phone').value;
                const paymentEl = document.querySelector('input[name="payment"]:checked');

                if (!firstName || !address || !phone) {
                    alert("Please fill in all required shipping details.");
                    return;
                }

                btn.innerText = "Transmitting Order...";
                btn.disabled = true;

                const orderData = {
                    order_number: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                    customer_name: `${firstName} ${lastName}`,
                    customer_email: this.user.email,
                    customer_phone: phone,
                    shipping_address: { address, city, pincode },
                    subtotal: window.StorefrontInstance.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0),
                    grand_total: window.StorefrontInstance.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0),
                    payment_method: paymentEl ? paymentEl.value : 'cod'
                };

                const { data, error } = await window.API.placeOrder(orderData);

                if (error) {
                    alert("Order failed: " + error);
                    btn.innerText = "Confirm Purchase";
                    btn.disabled = false;
                } else {
                    localStorage.removeItem('store_cart_v2');
                    window.StorefrontInstance.cart = [];
                    window.StorefrontInstance.syncCartUI();

                    document.body.innerHTML = `
                         <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: white;">
                            <div class="animate-reveal" style="width: 100px; height: 100px; background: var(--p-900); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 2.5rem; box-shadow: var(--shadow-float);">
                                <i data-lucide="check" style="width: 50px; height: 50px;"></i>
                            </div>
                            <h1 style="font-weight: 900; font-size: 3rem; margin-bottom: 1.5rem; color: var(--s-950);">Acquisition Confirmed!</h1>
                            <p class="section-subtitle" style="margin-bottom: 3rem; color: var(--s-100);">Reference ID: <b>${data.order_number}</b> has been archived to your dashboard.</p>
                            <a href="index.html" class="btn btn-primary" style="padding: 1.5rem 3.5rem;">Return to Archive</a>
                        </div>
                    `;
                    if (window.lucide) lucide.createIcons();
                }
            };
        }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => window.CheckoutExperience.init());
    else window.CheckoutExperience.init();
})();
