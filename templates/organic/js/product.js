
/**
 * Professional Product Insight Logic
 */

(function () {
    if (window.ProductExperience) return;

    window.ProductExperience = {
        product: null,
        qty: 1,

        async init() {
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');
            if (!id) {
                location.href = 'shop.html';
                return;
            }

            console.log("🏙️ Synching Product Specifications...");

            // Wait for Engine
            let tries = 0;
            while (!window.API?.tenant && tries < 40) {
                await new Promise(r => setTimeout(r, 100));
                tries++;
            }

            if (!window.API?.tenant) return;

            this.product = await window.API.getProduct(id);
            if (!this.product) {
                location.href = 'shop.html';
                return;
            }

            this.render();
            this.bindEvents();
        },

        render() {
            const p = this.product;
            document.title = `${p.name} | Elite Selection`;

            const img = document.getElementById('p-image');
            const name = document.getElementById('p-name');
            const price = document.getElementById('p-price');
            const desc = document.getElementById('p-description');
            const cat = document.getElementById('p-category');

            if (img) img.src = p.image_url || 'https://api.iconify.design/lucide:package.svg';
            if (name) name.innerText = p.name;
            if (price) price.innerText = window.StorefrontInstance.formatCurrency(p.price || p.rate || 0);
            if (desc) desc.innerText = p.description || 'This premium selection embodies our commitment to organic purity and sustainable harvesting. Each unit is carefully vetted for quality assurance before archival.';
            if (cat) cat.innerText = p.category_name || 'Elite Archive';

            this.updateQtyUI();
        },

        updateQtyUI() {
            const el = document.getElementById('p-qty');
            if (el) el.innerText = this.qty;
        },

        bindEvents() {
            const plus = document.getElementById('qty-plus');
            const minus = document.getElementById('qty-minus');
            const add = document.getElementById('add-to-cart');

            if (plus) plus.onclick = () => { this.qty++; this.updateQtyUI(); };
            if (minus) minus.onclick = () => { if (this.qty > 1) { this.qty--; this.updateQtyUI(); } };

            if (add) add.onclick = () => {
                window.StorefrontInstance.addToCart({
                    id: this.product.id,
                    name: this.product.name,
                    price: Number(this.product.price || this.product.rate || 0),
                    image_url: this.product.image_url
                }, this.qty);
            };
        }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => window.ProductExperience.init());
    else window.ProductExperience.init();
})();
