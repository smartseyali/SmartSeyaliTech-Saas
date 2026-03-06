
import api from './api.js';
import { mapper } from './mapper.js';
import { cartStore } from './cart.js';

const Fruitables = {
    async init() {
        console.log('Fruitables Init...');
        try {
            const settings = await api.getSettings();
            this.applySettings(settings);
        } catch (e) { console.warn('Settings failed:', e.message); }

        try {
            await this.renderCategoriesAndProducts();
        } catch (e) { console.warn('Categories/Products failed:', e.message); }

        this.updateCartBadge();
        window.addEventListener('cart-updated', () => this.updateCartBadge());

        // Setup Search
        const searchInput = document.querySelector('.hero-header input');
        const searchBtn = document.querySelector('.hero-header button');
        if (searchInput && searchBtn) {
            searchBtn.onclick = () => {
                const q = searchInput.value.trim();
                if (q) window.location.href = `shop.html?search=${encodeURIComponent(q)}`;
            };
        }
    },

    updateCartBadge() {
        const badge = document.querySelector('.navbar .fa-shopping-bag + span');
        if (badge) {
            const count = cartStore.get().reduce((sum, item) => sum + item.quantity, 0);
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    },

    applySettings(settings) {
        if (!settings) return;

        // Store Name
        const logoText = document.querySelector('.navbar-brand h1');
        if (logoText && settings.store_name) {
            logoText.textContent = settings.store_name;
        }

        // Primary Color
        if (settings.primary_color) {
            document.documentElement.style.setProperty('--bs-primary', settings.primary_color);
            document.documentElement.style.setProperty('--bs-secondary', settings.primary_color);
        }
    },

    async renderCategoriesAndProducts() {
        const categories = await api.getCategories();
        const products = await api.getProducts();

        const tabList = document.querySelector('.nav-pills.d-inline-flex');
        const tabContent = document.querySelector('.tab-content');

        if (!tabList || !tabContent) return;

        // 1. Render Tabs
        let tabsHtml = `
            <li class="nav-item">
                <a class="d-flex m-2 py-2 bg-light rounded-pill active" data-bs-toggle="pill" href="#tab-all">
                    <span class="text-dark" style="width: 130px;">All Products</span>
                </a>
            </li>
        `;

        categories.forEach((cat, index) => {
            tabsHtml += `
                <li class="nav-item">
                    <a class="d-flex py-2 m-2 bg-light rounded-pill" data-bs-toggle="pill" href="#tab-${cat.id}">
                        <span class="text-dark" style="width: 130px;">${cat.name}</span>
                    </a>
                </li>
            `;
        });
        tabList.innerHTML = tabsHtml;

        // 2. Render Tab Panes
        let contentHtml = `
            <div id="tab-all" class="tab-pane fade show p-0 active">
                <div class="row g-4">
                    <div class="col-lg-12">
                        <div class="row g-4" id="products-all">
                            ${this.renderProductList(products)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        categories.forEach(cat => {
            const catProducts = products.filter(p => p.category_id === cat.id);
            contentHtml += `
                <div id="tab-${cat.id}" class="tab-pane fade show p-0">
                    <div class="row g-4">
                        <div class="col-lg-12">
                            <div class="row g-4">
                                ${this.renderProductList(catProducts)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        tabContent.innerHTML = contentHtml;
    },

    renderProductList(productList) {
        if (!productList.length) return '<div class="col-12 text-center py-5">No products found in this category.</div>';

        return productList.map(p => {
            const m = mapper.mapProduct(p);
            return `
                <div class="col-md-6 col-lg-4 col-xl-3">
                    <div class="rounded position-relative fruite-item border border-secondary">
                        <div class="fruite-img" style="height: 200px; overflow: hidden;">
                            <img src="${m.image}" class="img-fluid w-100 rounded-top" alt="${m.name}" style="height: 100%; object-fit: cover;">
                        </div>
                        <div class="text-white bg-secondary px-3 py-1 rounded position-absolute" style="top: 10px; left: 10px;">${p.category || 'Product'}</div>
                        <div class="p-4 border border-secondary border-top-0 rounded-bottom">
                            <h4 style="height: 1.5em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${m.name}</h4>
                            <p style="height: 3em; overflow: hidden;">${m.description || 'Premium quality organic product.'}</p>
                            <div class="d-flex justify-content-between flex-lg-wrap">
                                <p class="text-dark fs-5 fw-bold mb-0">${mapper.formatCurrency(m.price)}</p>
                                <a href="product.html?id=${m.id}" class="btn border border-secondary rounded-pill px-3 text-primary">
                                    <i class="fa fa-shopping-bag me-2 text-primary"></i> View Detail
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
};

window.addEventListener('DOMContentLoaded', () => Fruitables.init());
export default Fruitables;
