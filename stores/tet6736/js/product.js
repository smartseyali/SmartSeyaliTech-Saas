
/**
 * Product detail page specific logic
 */

const ProductPage = {
    product: null,
    qty: 1,

    async init() {
        console.log("Initializing Product Details...");

        // Wait for tenant
        let tries = 0;
        while (!window.API.tenant && tries < 20) {
            await new Promise(r => setTimeout(r, 100));
            tries++;
        }

        if (!window.API.tenant) return;

        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (!id) {
            window.location.href = 'shop.html';
            return;
        }

        const product = await window.API.getProduct(id);
        if (!product) {
            console.error("Product not found");
            return;
        }

        this.product = product;
        this.renderProduct();
        this.renderRelated();
        this.bindLocalEvents();
    },

    renderProduct() {
        const p = this.product;
        const img = document.getElementById('p-image');
        const name = document.getElementById('p-name');
        const desc = document.getElementById('p-description');
        const price = document.getElementById('p-price');
        const cat = document.getElementById('p-category');

        if (img) img.src = p.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800';
        if (name) name.innerText = p.name;
        if (desc) desc.innerText = p.description || "Premium organic product curated for quality and health.";
        if (price) price.innerText = window.Storefront.formatCurrency(p.price || p.rate || 0);
        if (cat) cat.innerText = p.category_name || "General";
    },

    async renderRelated() {
        const products = await window.API.getProducts(this.product.category_name);
        const grid = document.getElementById('related-products');
        if (!grid) return;

        grid.innerHTML = products.filter(p => p.id !== this.product.id).slice(0, 4).map(p => `
            <div class="group bg-white p-4 rounded-3xl shadow-sm border border-slate-50">
                <a href="product.html?id=${p.id}" class="block space-y-4">
                    <div class="aspect-square relative overflow-hidden rounded-2xl bg-slate-50 border border-slate-100">
                        <img src="${p.image_url || 'https://api.iconify.design/lucide:package.svg'}" class="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    </div>
                </a>
                <div class="mt-4 space-y-1">
                    <h3 class="font-bold text-slate-800 text-sm">${p.name}</h3>
                    <p class="font-bold text-primary">${window.Storefront.formatCurrency(p.price || p.rate || 0)}</p>
                </div>
            </div>
        `).join('');
    },

    bindLocalEvents() {
        const plus = document.getElementById('qty-plus');
        const minus = document.getElementById('qty-minus');
        const qtyDisplay = document.getElementById('p-qty');
        const addBtn = document.getElementById('add-to-cart');

        if (plus) plus.onclick = () => {
            this.qty++;
            qtyDisplay.innerText = this.qty;
        };

        if (minus) minus.onclick = () => {
            if (this.qty > 1) {
                this.qty--;
                qtyDisplay.innerText = this.qty;
            }
        };

        if (addBtn) addBtn.onclick = () => {
            window.Storefront.addToCart(this.product, this.qty);
        };
    }
};

document.addEventListener('DOMContentLoaded', () => ProductPage.init());
