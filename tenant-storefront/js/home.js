
/**
 * Professional Home Page Dynamic Content Rendering
 */

const Homepage = {
    async init() {
        console.log("🛠️ Modernizing Home Page Content...");

        // Wait for tenant to be set (initialized in main.js)
        let tries = 0;
        while (!window.API.tenant && tries < 20) {
            await new Promise(r => setTimeout(r, 100));
            tries++;
        }

        if (!window.API.tenant) {
            console.error("❌ No valid tenant metadata found.");
            return;
        }

        this.renderBanners();
        this.renderHighlights();
        this.renderCategories();
        this.renderOffers();
        this.renderTopSelling();
        this.renderBottomBanners();

        // Final pass for icons
        if (window.lucide) setTimeout(() => lucide.createIcons(), 1000);
    },

    async renderBanners() {
        let banners = await window.API.getDynamicContent('hero_banners');
        const slider = document.querySelector('.hero-slider');
        if (!slider) return;

        if (banners.length === 0) {
            banners = [{
                title: window.API.tenant.name || "Precision Organic",
                subtitle: "The definitive collection of ethically sourced, premium quality organic essentials.",
                badge_text: "NEW SEASON COLLECTIONS",
                image_url: "assets/hero.png"
            }];
        }

        slider.innerHTML = banners.map((b, i) => `
            <div class="banner-slide ${i === 0 ? 'active' : ''} absolute inset-0 transition-opacity duration-1000 opacity-0" 
                style="background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.1)), url('${b.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600'}'); background-size: cover; background-position: center;"
            >
                <div class="container h-full flex flex-col justify-center text-white" style="gap: 1.5rem;">
                    ${b.badge_text ? `<span class="label animate-reveal" style="color:white; opacity: 0.8;">${b.badge_text}</span>` : ''}
                    <h1 class="text-6xl md:text-8xl font-black max-w-3xl animate-reveal" style="color:white; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.2));">${b.title || 'Welcome'}</h1>
                    <p class="text-xl text-white/90 max-w-xl animate-reveal" style="animation-delay: 0.1s;">${b.subtitle || 'Experience the future of organic shopping.'}</p>
                    <a href="shop.html" class="btn btn-primary animate-reveal" style="animation-delay: 0.2s; width: fit-content; padding: 1.25rem 3rem;">
                        View Catalog <i data-lucide="arrow-right"></i>
                    </a>
                </div>
            </div>
        `).join('');

        let current = 0;
        const slides = document.querySelectorAll('.banner-slide');
        if (slides.length > 1) {
            setInterval(() => {
                slides[current].style.opacity = '0';
                current = (current + 1) % slides.length;
                slides[current].style.opacity = '1';
            }, 6000);
            slides[0].style.opacity = '1';
        } else if (slides.length === 1) {
            slides[0].style.opacity = '1';
        }
    },

    async renderHighlights() {
        const highlights = await window.API.getDynamicContent('site_highlights');
        const grid = document.querySelector('.highlights-grid');
        if (!grid) return;

        if (highlights.length === 0) {
            grid.parentElement.style.display = 'none';
            return;
        }

        grid.innerHTML = highlights.slice(0, 3).map(h => `
            <div class="card flex items-center gap-6 p-8 card-hover">
                <div class="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-2xl text-primary">
                    <i data-lucide="shield-check" style="width: 24px; height: 24px;"></i>
                </div>
                <div>
                    <h4 class="font-bold text-slate-800" style="margin-bottom: 0.25rem; font-size: 1.1rem;">${h.title}</h4>
                    <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">${h.description}</p>
                </div>
            </div>
        `).join('');
    },

    async renderCategories() {
        const cats = await window.API.getDynamicContent('top_categories');
        const list = document.querySelector('.categories-list');
        if (!list) return;

        list.innerHTML = cats.map(c => `
            <a href="shop.html?category=${c.name}" class="flex flex-col items-center gap-4 shrink-0 group" style="text-decoration: none;">
                <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 group-hover:border-primary/20 transition-all p-1 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1">
                    <img src="${c.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'}" class="w-full h-full object-cover rounded-full" />
                </div>
                <span class="label group-hover:text-primary transition-colors">${c.name}</span>
            </a>
        `).join('');
    },

    async renderOffers() {
        const offers = await window.API.getDynamicContent('offer_zone');
        const grid = document.querySelector('.offers-grid');
        if (!grid) return;

        if (offers.length === 0) return;

        grid.innerHTML = offers.map(o => `
            <div class="relative h-72 rounded-[32px] overflow-hidden shadow-xl group card-hover">
                <img src="${o.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'}" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-10">
                    <div class="text-white space-y-3">
                        <span class="label" style="background: var(--primary); color: white; padding: 4px 12px; border-radius: 99px; font-size: 10px;">${o.badge_label || "EXCLUSIVE"}</span>
                        <h3 class="text-3xl font-black" style="color:white; line-height: 1;">${o.title}</h3>
                        <p class="text-white/70 text-sm font-medium leading-relaxed">${o.description || ''}</p>
                    </div>
                </div>
            </div>
        `).join('');
    },

    async renderTopSelling() {
        const products = await window.API.getDynamicContent('top_selling');
        const grid = document.querySelector('.products-grid');
        if (!grid) return;

        grid.innerHTML = products.map(p => `
            <div class="card product-card card-hover group" style="padding: 1rem;">
                <a href="product.html?id=${p.id}" class="product-image-box">
                    <img src="${p.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'}" />
                </a>
                <div class="space-y-2 px-2 pb-4">
                    <div class="flex justify-between items-start">
                        <h3 class="font-bold text-slate-900 leading-tight" style="font-size: 1.125rem;">${p.name}</h3>
                    </div>
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
    },

    async renderBottomBanners() {
        const banners = await window.API.getDynamicContent('bottom_banners');
        const grid = document.querySelector('.bottom-banners-row');
        if (!grid) return;

        grid.innerHTML = banners.map(b => `
            <div class="min-w-[450px] h-56 rounded-[32px] overflow-hidden shadow-lg shrink-0 group card-hover">
                <img src="${b.image_url}" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            </div>
        `).join('');
    }
};

document.addEventListener('DOMContentLoaded', () => Homepage.init());
