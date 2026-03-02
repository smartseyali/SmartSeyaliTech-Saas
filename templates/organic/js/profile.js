
/**
 * Professional Dashboard & Profile Logic
 */

(function () {
    if (window.ProfileExperience) return;

    window.ProfileExperience = {
        user: null,
        activeTab: 'details',

        async init() {
            console.log("🏙️ Synching Profile Intelligence...");

            // Wait for Engine
            let tries = 0;
            while (!window.API?.tenant && tries < 40) {
                await new Promise(r => setTimeout(r, 100));
                tries++;
            }

            if (!window.API?.tenant) return;

            this.user = await window.API.getUser();
            if (!this.user) {
                location.href = 'login.html';
                return;
            }

            this.renderTab('details');
            this.bindEvents();
        },

        async renderTab(tabId) {
            this.activeTab = tabId;
            const content = document.getElementById('tab-content');
            if (!content) return;

            // Highlight active button
            document.querySelectorAll('.sidebar-btn').forEach(btn => {
                if (btn.dataset.tab === tabId) btn.classList.add('active');
                else btn.classList.remove('active');
            });

            if (tabId === 'details') {
                content.innerHTML = `
                    <div class="card p-12 animate-reveal">
                        <h2 class="text-3xl font-black text-s-950 mb-10">Identity Intelligence</h2>
                        <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 3rem;">
                            <div class="space-y-4">
                                <label class="label">Legal Full Name</label>
                                <p class="text-xl font-black text-s-800">${this.user.user_metadata?.full_name || 'Authorized User'}</p>
                            </div>
                            <div class="space-y-4">
                                <label class="label">Protocol ID (Email)</label>
                                <p class="text-xl font-black text-s-800">${this.user.email}</p>
                            </div>
                            <div class="space-y-4">
                                <label class="label">Account Status</label>
                                <span class="label" style="background: var(--p-50); color: var(--p-900); padding: 4px 12px; border-radius: 99px; width:fit-content; display:inline-block; font-size: 8px;">Active Archives</span>
                            </div>
                        </div>
                        <div class="pt-12 border-t border-s-50 mt-12">
                             <button class="btn btn-primary" style="padding: 1rem 3rem;">Update Intelligence</button>
                        </div>
                    </div>
                `;
            }

            if (tabId === 'orders') {
                const orders = await window.API.getOrders();
                if (!orders || orders.length === 0) {
                    content.innerHTML = `<div class="card p-20 text-center label">No previous acquisition history detected in the archive.</div>`;
                    return;
                }
                content.innerHTML = `
                    <div class="card p-12 animate-reveal">
                        <h2 class="text-3xl font-black text-s-950 mb-10">Transmitted Acquisitions</h2>
                        <div class="space-y-8">
                            ${orders.map(o => `
                                <div class="p-8 border border-s-100 rounded-[32px] flex items-center justify-between card-hover">
                                    <div class="space-y-2">
                                        <p class="label" style="margin:0;">Ref: ${o.order_number}</p>
                                        <h4 class="text-xl font-black text-s-900">Archived on ${new Date(o.created_at).toLocaleDateString()}</h4>
                                    </div>
                                    <div class="text-right space-y-2">
                                         <p class="text-2xl font-black text-p-900">${window.StorefrontInstance.formatCurrency(o.grand_total)}</p>
                                         <span class="label" style="font-size: 8px; color: var(--s-400);">${o.status || 'Fulfilled'}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            if (tabId === 'addresses') {
                content.innerHTML = `<div class="card p-20 text-center label">Destiny Logistics Archives coming soon.</div>`;
            }

            if (window.lucide) lucide.createIcons();
        },

        bindEvents() {
            document.addEventListener('click', (e) => {
                const btn = e.target.closest('.sidebar-btn[data-tab]');
                if (btn) this.renderTab(btn.dataset.tab);

                if (e.target.id === 'logout-btn') {
                    window.API.signOut().then(() => location.href = 'index.html');
                }
            });
        }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => window.ProfileExperience.init());
    else window.ProfileExperience.init();
})();
