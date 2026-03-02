
/**
 * Professional Product Intelligence Logic
 */

(function () {
    if (window.ProductPageInstance) return;

    window.ProductPageInstance = {
        product: null,
        qty: 1,

        async init() {
            console.log("🛠️ Loading Certified Product Intelligence...");

            // Wait for tenant
            let tries = 0;
            while (!window.API?.tenant && tries < 30) {
                await new Promise(r => setTimeout(r, 100));
                tries++;
            }

            if (!window.API?.tenant) return;

            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');
            if (!id) {
                window.location.href = 'shop.html';
                return;
            }

            const p = await window.API.getProduct(id);
            if (!p) {
                window.location.href = 'shop.html';
                return;
            }

            this.product = p;
            this.render();
            this.bind();
        },

        render() {
            const p = this.product;
            const img = document.getElementById('p-image');
            const name = document.getElementById('p-name');
            const desc = document.getElementById('p-description');
            const price = document.getElementById('p-price');
            const cat = document.getElementById('p-category');

            if (img) img.src = p.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200';
            if (name) name.innerText = p.name;
            if (desc) desc.innerText = p.description || "Indulge in the therapeutic essence of nature with this meticulously curated selection, harvested at peak vitality for maximum purity and effectiveness.";
            if (price) price.innerText = window.StorefrontInstance.formatCurrency(p.price || p.rate || 0);
            if (cat) cat.innerText = p.category_name || "Premium Selection";
        },

        bind() {
            const plus = document.getElementById('qty-plus');
            const minus = document.getElementById('qty-minus');
            const qtyDisplay = document.getElementById('p-qty');
            const addBtn = document.getElementById('add-to-cart');

            if (plus) plus.onclick = () => {
                this.qty++;
                if (qtyDisplay) qtyDisplay.innerText = this.qty;
            };

            if (minus) minus.onclick = () => {
                if (this.qty > 1) {
                    this.qty--;
                    if (qtyDisplay) qtyDisplay.innerText = this.qty;
                }
            };

            if (addBtn) addBtn.onclick = () => {
                window.StorefrontInstance.addToCart({
                    id: this.product.id,
                    name: this.product.name,
                    price: Number(this.product.price || this.product.rate || 0),
                    image_url: this.product.image_url
                }, this.qty);
            };
        }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => window.ProductPageInstance.init());
    else window.ProductPageInstance.init();
})();
