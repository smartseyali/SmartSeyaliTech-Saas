
/**
 * Shop Page specific logic
 */

const Shoppage = {
    async init() {
        console.log("Initializing Shop Page...");

        // Wait for tenant to be set
        let tries = 0;
        while (!window.API.tenant && tries < 20) {
            await new Promise(r => setTimeout(r, 100));
            tries++;
        }

        if (!window.API.tenant) return;

        // Check for category filter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const activeCategory = urlParams.get('category');

        this.renderCategories(activeCategory);
        this.renderProducts(activeCategory);
    },

    async renderCategories(active = null) {
        const cats = await window.API.getDynamicContent('top_categories');
        const filters = document.getElementById('categories-filters');
        if (!filters) return;

        filters.innerHTML = `
            <label class="filter-item"><input type="radio" name="category" value="all" ${!active || active === 'all' ? 'checked' : ''} /> All Products</label>
            ${cats.map(c => `
                <label class="filter-item">
                    <input type="radio" name="category" value="${c.name}" ${active === c.name ? 'checked' : ''} /> 
                    ${c.name}
                </label>
            `).join('')}
        `;

        // Add filter listeners
        filters.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', (e) => {
                const val = e.target.value === 'all' ? null : e.target.value;
                this.renderProducts(val);
                // Update URL without reloading
                const url = new URL(window.location);
                if (val) url.searchParams.set('category', val);
                else url.searchParams.delete('category');
                window.history.pushState({}, '', url);
            });
        });
    },

    async renderProducts(category = null) {
        const grid = document.querySelector('.products-grid');
        const count = document.getElementById('results-count');
        if (!grid) return;

        grid.innerHTML = `<div class="col-span-full h-40 flex items-center justify-center text-slate-300">Filtering products...</div>`;

        const products = await window.API.getProducts(category);
        if (count) count.innerText = `Showing ${products.length} products`;

        if (products.length === 0) {
            grid.innerHTML = `<div class="col-span-full h-40 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-400">No products found for this category.</div>`;
            return;
        }

        grid.innerHTML = products.map(p => `
            <div class="group">
                <a href="product.html?id=${p.id}" class="block space-y-4">
                    <div class="aspect-square relative overflow-hidden rounded-2xl bg-slate-50 border border-slate-100">
                        <img src="${p.image_url || 'https://api.iconify.design/lucide:package.svg'}" class="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    </div>
                </a>
                <div class="mt-4 space-y-1">
                    <h3 class="font-bold text-slate-800">${p.name}</h3>
                    <p class="text-sm text-slate-400">${p.category_name || 'General'}</p>
                    <p class="text-lg font-bold text-primary">${window.Storefront.formatCurrency(p.price || p.rate || 0)}</p>
                    <button class="add-to-cart-btn btn btn-primary mt-4 w-full text-xs"
                        data-id="${p.id}" data-name="${p.name}" data-price="${p.price || p.rate || 0}" data-image="${p.image_url}">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    }
};

document.addEventListener('DOMContentLoaded', () => Shoppage.init());
