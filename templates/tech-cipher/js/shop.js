
/**
 * Professional Catalog Logic
 */

(function () {
    if (window.CatalogExperience) return;

    window.CatalogExperience = {
        products: [],
        filtered: [],
        categories: [],

        async init() {
            console.log("🏙️ Synching Catalog Dashboard...");

            // Wait for Engine
            let tries = 0;
            while (!window.API?.tenant && tries < 40) {
                await new Promise(r => setTimeout(r, 100));
                tries++;
            }

            if (!window.API?.tenant) return;

            this.loadData();
            this.bindEvents();
        },

        async loadData() {
            const data = await window.API.getProducts();
            this.products = data || [];
            this.filtered = [...this.products];

            // Extract categories
            const cats = new Set(this.products.map(p => p.category_name).filter(Boolean));
            this.categories = Array.from(cats);

            this.renderCategories();
            this.renderProducts();
        },

        renderCategories() {
            const container = document.getElementById('category-filter');
            if (!container) return;

            const html = this.categories.map(c => `
                <button class="sidebar-btn" data-category="${c}">
                    <i data-lucide="circle" style="width: 14px; opacity: 0.3;"></i>
                    ${c}
                </button>
            `).join('');

            // Keep the "All" button
            const allBtn = `
                <button class="sidebar-btn active" data-category="all">
                    <i data-lucide="layout-grid" style="width: 18px;"></i>
                    Full Archive
                </button>
            `;
            container.innerHTML = allBtn + html;
            if (window.lucide) lucide.createIcons();
        },

        renderProducts() {
            const grid = document.getElementById('catalog-grid');
            if (!grid) return;

            if (this.filtered.length === 0) {
                grid.innerHTML = `<div class="p-20 text-center w-full col-span-full label">No matching archival intelligence found.</div>`;
                return;
            }

            grid.innerHTML = this.filtered.map(p => `
                <article class="product-card card-hover group cursor-pointer animate-reveal shadow-subtle p-6" onclick="location.href='product.html?id=${p.id}'">
                    <div class="product-image-container rounded-[24px]">
                        <img src="${p.image_url || 'https://api.iconify.design/lucide:package.svg'}" loading="lazy" />
                        <div class="absolute top-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                             <button class="w-12 h-12 bg-white flex items-center justify-center rounded-full shadow-xl hover:bg-p-900 hover:text-white transition-colors" 
                                     onclick="event.stopPropagation(); window.StorefrontInstance.addToCart({id:'${p.id}', name:'${p.name}', price:${p.price || p.rate || 0}, image_url:'${p.image_url}'})">
                                <i data-lucide="plus" style="width:18px;"></i>
                             </button>
                        </div>
                    </div>
                    <div class="mt-8 space-y-4">
                        <div class="flex justify-between items-start">
                             <div class="space-y-1">
                                <h3 class="text-lg font-black text-s-950">${p.name}</h3>
                                <p class="label" style="font-size: 8px; opacity: 0.5;">${p.category_name || 'Archive'}</p>
                             </div>
                             <p class="text-lg font-black text-p-900">${window.StorefrontInstance.formatCurrency(p.price || p.rate || 0)}</p>
                        </div>
                    </div>
                </article>
            `).join('');
            if (window.lucide) lucide.createIcons();
        },

        bindEvents() {
            document.addEventListener('click', (e) => {
                const btn = e.target.closest('.sidebar-btn[data-category]');
                if (btn) {
                    const cat = btn.dataset.category;
                    document.querySelectorAll('.sidebar-btn[data-category]').forEach(el => el.classList.remove('active'));
                    btn.classList.add('active');

                    if (cat === 'all') this.filtered = [...this.products];
                    else this.filtered = this.products.filter(p => p.category_name === cat);

                    this.renderProducts();
                }

                if (e.target.id === 'sort-price-low') {
                    this.filtered.sort((a, b) => (a.price || a.rate || 0) - (b.price || b.rate || 0));
                    this.renderProducts();
                }
                if (e.target.id === 'sort-price-high') {
                    this.filtered.sort((a, b) => (b.price || b.rate || 0) - (a.price || a.rate || 0));
                    this.renderProducts();
                }
            });
        }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => window.CatalogExperience.init());
    else window.CatalogExperience.init();
})();
