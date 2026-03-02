
/**
 * Visual Home Experience Logic
 */

(function () {
    if (window.HomeExperience) return;

    window.HomeExperience = {
        async init() {
            console.log("🏙️ Initializing Elite Home Aesthetics...");

            // Wait for Engine
            let tries = 0;
            while (!window.API?.tenant && tries < 40) {
                await new Promise(r => setTimeout(r, 100));
                tries++;
            }

            if (!window.API?.tenant) return;

            this.renderHighlights();
            this.renderCategories();
            this.renderBestSellers();
        },

        async renderHighlights() {
            const data = await window.API.getDynamicContent('site_highlights');
            const container = document.getElementById('highlights-container');
            if (!container) return;

            if (data.length === 0) {
                // High-End Fallbacks
                const fallbacks = [
                    { title: "Ethical Harvest", icon: "leaf", desc: "100% Certified Organic origins only." },
                    { title: "Global Logistics", icon: "globe", desc: "Priority shipping across the subcontinent." },
                    { title: "Pure Assurance", icon: "shield-check", desc: "Rigorous laboratory quality verification." }
                ];
                container.innerHTML = fallbacks.map(h => `
                    <div class="card p-10 flex flex-col gap-6 card-hover" style="border-radius: var(--radius-lg);">
                        <div class="w-16 h-16 bg-p-50 flex items-center justify-center rounded-2xl text-p-900 shadow-inner">
                            <i data-lucide="${h.icon}" style="width: 32px; height: 32px;"></i>
                        </div>
                        <div class="space-y-2">
                             <h4 class="text-xl font-black">${h.title}</h4>
                             <p class="text-sm text-s-500 font-medium">${h.desc}</p>
                        </div>
                    </div>
                `).join('');
                if (window.lucide) lucide.createIcons();
                return;
            }

            container.innerHTML = data.slice(0, 3).map(h => `
                 <div class="card p-10 flex flex-col gap-6 card-hover">
                    <div class="w-16 h-16 bg-p-50 flex items-center justify-center rounded-2xl text-p-900 shadow-inner">
                        <i data-lucide="sparkles" style="width: 32px; height: 32px;"></i>
                    </div>
                    <div class="space-y-2">
                         <h4 class="text-xl font-black">${h.title}</h4>
                         <p class="text-sm text-s-500 font-medium">${h.description}</p>
                    </div>
                </div>
            `).join('');
            if (window.lucide) lucide.createIcons();
        },

        async renderCategories() {
            const data = await window.API.getDynamicContent('top_categories');
            const container = document.getElementById('categories-container');
            if (!container) return;

            container.innerHTML = data.map(c => `
                <a href="shop.html?category=${c.name}" class="group flex flex-col items-center gap-6 animate-reveal">
                    <div class="w-32 h-32 rounded-full overflow-hidden border-2 border-transparent group-hover:border-p-900 transition-all p-1.5 bg-white shadow-luxe">
                        <img src="${c.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300'}" class="w-full h-full object-cover rounded-full" />
                    </div>
                    <span class="label" style="margin:0; font-size: 10px; opacity: 0.8;">${c.name}</span>
                </a>
            `).join('');
        },

        async renderBestSellers() {
            const data = await window.API.getDynamicContent('top_selling');
            const container = document.getElementById('best-sellers-container');
            if (!container) return;

            if (data.length === 0) {
                container.innerHTML = `<div class="p-20 text-center w-full col-span-full label">Archiving New Harvest Intelligence...</div>`;
                return;
            }

            container.innerHTML = data.map(p => `
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
                            <h3 class="text-xl font-black text-s-950">${p.name}</h3>
                            <p class="text-lg font-black text-p-900">${window.StorefrontInstance.formatCurrency(p.price || p.rate || 0)}</p>
                        </div>
                        <p class="text-sm text-s-400 font-medium line-clamp-2">${p.description || 'Premium certified organic selection for health-conscious connoisseurs.'}</p>
                    </div>
                </article>
            `).join('');
            if (window.lucide) lucide.createIcons();
        }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => window.HomeExperience.init());
    else window.HomeExperience.init();
})();
