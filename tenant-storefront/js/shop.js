
/**
 * Professional Shop Page Logic
 */

(function () {
    if (window.ShoppageInstance) return;

    window.ShoppageInstance = {
        async init() {
            console.log("🛠️ Loading Optimized Shop Experience...");

            // Wait for tenant to be set
            let tries = 0;
            while (!window.API?.tenant && tries < 50) {
                await new Promise(r => setTimeout(r, 100));
                tries++;
            }

            if (!window.API?.tenant) return;

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
                <button class="sidebar-btn ${!active || active === 'all' ? 'active' : ''}" data-category="all">
                    <i data-lucide="layers" style="width:16px; height:16px;"></i> All Collections
                </button>
                ${cats.map(c => `
                    <button class="sidebar-btn ${active === c.name ? 'active' : ''}" data-category="${c.name}">
                        <i data-lucide="tag" style="width:16px; height:16px;"></i> ${c.name}
                    </button>
                `).join('')}
            `;

            if (window.lucide) lucide.createIcons();

            // Add filter listeners
            filters.querySelectorAll('.sidebar-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const category = btn.getAttribute('data-category');
                    const val = category === 'all' ? null : category;

                    // Update Active state UI
                    filters.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

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
            const grid = document.getElementById('shop-products-grid');
            const count = document.getElementById('results-count');
            if (!grid) return;

            grid.innerHTML = `
                <div class="col-span-full h-80 flex flex-col items-center justify-center text-slate-300 gap-4">
                    <i data-lucide="loader" class="animate-spin w-10 h-10"></i>
                    <span class="label">Filtering Inventory...</span>
                </div>
            `;
            if (window.lucide) lucide.createIcons();

            const products = await window.API.getProducts(category);
            if (count) count.innerText = `Showing ${products.length} products`;

            if (products.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-full h-80 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[32px] text-slate-400">
                        <i data-lucide="search-x" class="w-12 h-12 mb-4 opacity-20"></i>
                        <span class="label">No matches found in this collection.</span>
                    </div>
                `;
                if (window.lucide) lucide.createIcons();
                return;
            }

            grid.innerHTML = products.map(p => `
                <div class="card product-card card-hover group" style="padding: 1rem;">
                    <a href="product.html?id=${p.id}" class="product-image-box">
                        <img src="${p.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'}" />
                    </a>
                    <div class="space-y-2 px-2 pb-4">
                        <div class="flex justify-between items-start">
                            <h3 class="font-bold text-slate-900 leading-tight" style="font-size: 1.125rem;">${p.name}</h3>
                        </div>
                        <p class="label" style="text-transform: none; color: var(--slate-400); font-weight: 500;">${p.category_name || 'Premium Selection'}</p>
                        <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                            <p class="text-xl font-black text-primary">${window.Storefront.formatCurrency(p.price || p.rate || 0)}</p>
                            <button class="add-to-cart-btn btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.8rem;"
                                data-id="${p.id}" data-name="${p.name}" data-price="${p.price || p.rate || 0}" data-image="${p.image_url}">
                                <i data-lucide="plus"></i> Add
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            if (window.lucide) lucide.createIcons();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.ShoppageInstance.init());
    } else {
        window.ShoppageInstance.init();
    }
})();
