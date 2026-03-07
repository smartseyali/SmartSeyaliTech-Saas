
import api from './api.js';
import { mapper } from './mapper.js';
import { cartStore } from './cart.js';

const Shop = {
    async init() {
        console.log('Shop Init...');
        try {
            const settings = await api.getSettings();
            this.applySettings(settings);
        } catch (e) { console.warn('Settings failed:', e.message); }

        try {
            await this.renderShop();
        } catch (e) { console.warn('Shop render failed:', e.message); }

        this.updateCartBadge();
        window.addEventListener('cart-updated', () => this.updateCartBadge());
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
        const logoText = document.querySelector('.navbar-brand h1');
        if (logoText && settings.store_name) {
            logoText.textContent = settings.store_name;
        }
        if (settings.primary_color) {
            document.documentElement.style.setProperty('--bs-primary', settings.primary_color);
            document.documentElement.style.setProperty('--bs-secondary', settings.primary_color);
        }
    },

    async renderShop() {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryId = urlParams.get('category');
        const search = urlParams.get('search');

        const categories = await api.getCategories();
        const products = await api.getProducts({ category_id: categoryId, search: search });

        // 1. Render Categories Sidebar
        const catList = document.querySelector('.fruite-categorie');
        if (catList) {
            catList.innerHTML = categories.map(cat => `
                <li>
                    <div class="d-flex justify-content-between fruite-name">
                        <a href="shop.html?category=${cat.id}"><i class="fas fa-apple-alt me-2"></i>${cat.name}</a>
                    </div>
                </li>
            `).join('');
        }

        // 2. Render Products Grid
        const grid = document.querySelector('.col-lg-9 .row.g-4.justify-content-center');
        if (grid) {
            grid.innerHTML = products.map(p => {
                const m = mapper.mapProduct(p);
                return `
                    <div class="col-md-6 col-lg-6 col-xl-4">
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

            // Remove pagination for now if it's static
            const pagination = document.querySelector('.pagination');
            if (pagination && products.length < 10) pagination.style.display = 'none';
        }
    }
};

window.addEventListener('DOMContentLoaded', () => Shop.init());
export default Shop;
