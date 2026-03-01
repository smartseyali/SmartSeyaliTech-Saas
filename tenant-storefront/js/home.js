
/**
 * Home Page specific logic
 */

const Homepage = {
    async init() {
        console.log("Initializing Home Page Content...");

        // Wait for tenant to be set (initialized in main.js)
        let tries = 0;
        while (!window.API.tenant && tries < 20) {
            await new Promise(r => setTimeout(r, 100));
            tries++;
        }

        if (!window.API.tenant) {
            console.error("No tenant found, aborting home page render.");
            return;
        }

        this.renderBanners();
        this.renderHighlights();
        this.renderCategories();
        this.renderOffers();
        this.renderTopSelling();
        this.renderBottomBanners();
    },

    async renderBanners() {
        const banners = await window.API.getDynamicContent('hero_banners');
        const slider = document.querySelector('.hero-slider');
        if (!slider) return;

        if (banners.length === 0) {
            slider.innerHTML = `<div class="w-full h-full bg-slate-200 flex items-center justify-center">No Banners Found</div>`;
            return;
        }

        slider.innerHTML = banners.map((b, i) => `
            <div class="banner-slide ${i === 0 ? 'active' : ''} absolute inset-0 transition-opacity duration-1000 opacity-0 bg-cover bg-center" 
                style="background-image: url('${b.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600'}');"
            >
                <div class="absolute inset-0 bg-black/30"></div>
                <div class="container mx-auto px-6 h-full flex flex-col justify-center text-white space-y-4">
                    ${b.badge_text ? `<span class="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold w-fit">${b.badge_text}</span>` : ''}
                    <h1 class="text-4xl md:text-6xl font-bold max-w-2xl">${b.title || 'Welcome'}</h1>
                    <p class="text-lg text-white/90 max-w-xl">${b.subtitle || 'Shop our latest collections.'}</p>
                    <a href="shop.html" class="bg-white text-slate-800 px-8 py-3 rounded-xl font-bold w-fit hover:bg-slate-100 transition-all flex items-center gap-2">
                        Shop Now <i class="lucide-arrow-right w-5 h-5"></i>
                    </a>
                </div>
            </div>
        `).join('');

        // Simple auto-advancing logic
        let current = 0;
        const slides = document.querySelectorAll('.banner-slide');
        if (slides.length > 1) {
            setInterval(() => {
                slides[current].classList.remove('active', 'opacity-100');
                slides[current].classList.add('opacity-0');
                current = (current + 1) % slides.length;
                slides[current].classList.add('active', 'opacity-100');
                slides[current].classList.remove('opacity-0');
            }, 5000);
            slides[current].classList.add('opacity-100');
            slides[current].classList.remove('opacity-0');
        } else if (slides.length === 1) {
            slides[0].classList.add('opacity-100');
            slides[0].classList.remove('opacity-0');
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
            <div class="flex items-center gap-6 p-6 bg-white rounded-3xl shadow-sm border border-slate-50">
                <div class="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-2xl">
                    <img src="${h.image_url || 'https://api.iconify.design/lucide:sparkles.svg'}" class="w-8 h-8 opacity-20" />
                </div>
                <div>
                    <h4 class="font-bold text-slate-800">${h.title}</h4>
                    <p class="text-xs text-slate-400">${h.description}</p>
                </div>
            </div>
        `).join('');
    },

    async renderCategories() {
        const cats = await window.API.getDynamicContent('top_categories');
        const list = document.querySelector('.categories-list');
        if (!list) return;

        list.innerHTML = cats.map(c => `
            <a href="shop.html?category=${c.name}" class="flex flex-col items-center gap-3 shrink-0 group">
                <div class="w-24 h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all p-1">
                    <img src="${c.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'}" class="w-full h-full object-cover rounded-full" />
                </div>
                <span class="text-xs font-bold text-slate-700">${c.name}</span>
            </a>
        `).join('');
    },

    async renderOffers() {
        const offers = await window.API.getDynamicContent('offer_zone');
        const grid = document.querySelector('.offers-grid');
        if (!grid) return;

        if (offers.length === 0) {
            grid.innerHTML = `<div class="col-span-full h-40 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 text-sm">New Deals Coming Soon!</div>`;
            return;
        }

        grid.innerHTML = offers.map(o => `
            <div class="relative h-64 rounded-3xl overflow-hidden shadow-lg group">
                <img src="${o.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'}" class="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div class="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center p-8">
                    <div class="text-white space-y-2">
                        <span class="bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase">${o.badge_label || "Deal"}</span>
                        <h3 class="text-2xl font-bold">${o.title}</h3>
                        <p class="text-white/80 text-sm max-w-[200px]">${o.description || ''}</p>
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
            <div class="group">
                <a href="product.html?id=${p.id}" class="block space-y-4">
                    <div class="aspect-square relative overflow-hidden rounded-2xl bg-slate-50 border border-slate-100">
                        <img src="${p.image_url || 'https://api.iconify.design/lucide:package.svg'}" class="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    </div>
                </a>
                <div class="mt-4 space-y-1">
                    <h3 class="font-bold text-slate-800">${p.name}</h3>
                    <p class="text-lg font-bold text-primary">${window.Storefront.formatCurrency(p.price || p.rate || 0)}</p>
                    <button class="add-to-cart-btn mt-2 w-full bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                        data-id="${p.id}" data-name="${p.name}" data-price="${p.price || p.rate || 0}" data-image="${p.image_url}">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    },

    async renderBottomBanners() {
        const banners = await window.API.getDynamicContent('bottom_banners');
        const grid = document.querySelector('.bottom-banners-row');
        if (!grid) return;

        grid.innerHTML = banners.map(b => `
            <div class="min-w-[400px] h-48 rounded-3xl overflow-hidden shadow-md shrink-0">
                <img src="${b.image_url}" class="w-full h-full object-cover" />
            </div>
        `).join('');
    }
};

document.addEventListener('DOMContentLoaded', () => Homepage.init());
