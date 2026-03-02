/**
 * Professional Profile & Account Management
 */

(function () {
    const profile = {
        async init() {
            console.log("🛠️ Profile System Booting...");

            if (!window.API) return;

            const user = await window.API.getUser();
            if (!user) {
                window.location.href = 'login.html';
                return;
            }

            this.syncStaticData(user);
            this.initTabs();
            this.loadOrders();
            this.loadAddresses();
            this.bindCoreActions(user);

            console.log("✅ Profile Ready.");
        },

        syncStaticData(user) {
            const emailDisp = document.getElementById('user-display-email');
            const nameDisp = document.getElementById('user-display-name');
            const prefName = document.getElementById('pref-name');
            const prefEmail = document.getElementById('pref-email');
            const prefPhone = document.getElementById('pref-phone');

            if (emailDisp) emailDisp.innerText = user.email;
            if (nameDisp) nameDisp.innerText = user.user_metadata?.full_name || 'Account Member';

            if (prefEmail) prefEmail.value = user.email;
            if (prefName) prefName.value = user.user_metadata?.full_name || '';
            if (prefPhone) prefPhone.value = user.user_metadata?.phone || '';
        },

        initTabs() {
            const btns = document.querySelectorAll('.profile-nav-btn');
            const tabs = document.querySelectorAll('.profile-tab');

            btns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const tabId = btn.dataset.tab;
                    if (!tabId) return;

                    btns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    tabs.forEach(t => {
                        t.style.display = t.id === `tab-${tabId}` ? 'block' : 'none';
                    });
                });
            });

            // Address Form Toggle
            const addBtn = document.getElementById('add-address-btn');
            const cancelBtn = document.getElementById('cancel-address');
            const formContainer = document.getElementById('address-form-container');

            if (addBtn) addBtn.addEventListener('click', () => formContainer.style.display = 'block');
            if (cancelBtn) cancelBtn.addEventListener('click', () => formContainer.style.display = 'none');
        },

        async loadOrders() {
            const container = document.getElementById('orders-list');
            if (!container) return;

            try {
                const orders = await window.API.getOrders();

                if (!orders || orders.length === 0) {
                    container.innerHTML = `
                        <div class="card p-20 text-center" style="border: 2px dashed var(--slate-100);">
                            <i data-lucide="package-x" class="w-12 h-12 mx-auto mb-4 opacity-10"></i>
                            <p class="section-subtitle">No purchase history found. Your future transactions will appear here.</p>
                            <a href="shop.html" class="btn btn-primary mt-6">Start Shopping</a>
                        </div>
                    `;
                } else {
                    container.innerHTML = orders.map(o => `
                        <div class="card flex flex-col md:flex-row items-center justify-between gap-6 card-hover">
                            <div class="flex items-center gap-6">
                                <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                                    <i data-lucide="shopping-bag"></i>
                                </div>
                                <div>
                                    <p class="label" style="margin-bottom: 4px; color: var(--slate-400);">Ref: #${o.id.slice(0, 8)}</p>
                                    <h4 class="font-black text-slate-800" style="font-size: 1.25rem;">${new Date(o.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</h4>
                                </div>
                            </div>
                            <div class="flex items-center gap-10">
                                <div class="text-right">
                                    <p class="label" style="margin-bottom: 4px;">Status</p>
                                    <span class="label" style="background: ${o.status === 'completed' ? 'var(--primary-soft)' : '#fff9eb'}; color: ${o.status === 'completed' ? 'var(--primary)' : '#b45309'}; padding: 4px 12px; border-radius: 99px;">${o.status.toUpperCase()}</span>
                                </div>
                                <div class="text-right">
                                    <p class="label" style="margin-bottom: 4px;">Total</p>
                                    <p class="text-2xl font-black text-primary">${window.Storefront.formatCurrency(o.total_amount)}</p>
                                </div>
                            </div>
                        </div>
                    `).join('');
                }
                if (window.lucide) lucide.createIcons();
            } catch (e) {
                container.innerHTML = `<p class="label text-center" style="color:red;">Error synchronizing transactions.</p>`;
            }
        },

        async loadAddresses() {
            const grid = document.getElementById('addresses-list');
            if (!grid) return;

            try {
                const addrs = await window.API.getAddresses();

                if (!addrs || addrs.length === 0) {
                    grid.innerHTML = `<div class="col-span-full card p-10 text-center text-slate-400 label" style="border: 2px dashed var(--slate-100);">No shipping destinations archived.</div>`;
                } else {
                    grid.innerHTML = addrs.map(a => `
                        <div class="card card-hover space-y-6">
                            <div class="flex justify-between items-start">
                                <div class="flex items-center gap-3 text-primary">
                                    <i data-lucide="map-pin" style="width:16px;"></i>
                                    <span class="label">Destination</span>
                                </div>
                                <button class="btn btn-ghost" style="padding:4px;"><i data-lucide="more-vertical" style="width:16px;"></i></button>
                            </div>
                            <div>
                                <h4 class="text-lg font-black text-slate-800">${a.address_line1}</h4>
                                <p class="label" style="text-transform:none; margin-top: 4px;">${a.city}, ${a.zip_code}</p>
                            </div>
                        </div>
                    `).join('');
                }
                if (window.lucide) lucide.createIcons();
            } catch (e) { }
        },

        bindCoreActions(user) {
            // Personal Details Sync
            document.getElementById('details-form')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = e.target.querySelector('button[type="submit"]');
                const originalText = btn.innerText;

                btn.innerText = 'Synchronizing...';
                btn.disabled = true;

                const name = document.getElementById('pref-name').value;
                const phone = document.getElementById('pref-phone').value;

                const { error } = await window.supabase.auth.updateUser({
                    data: { full_name: name, phone: phone }
                });

                if (error) {
                    window.Storefront.pushNotification("Update Failed: " + error.message);
                } else {
                    window.Storefront.pushNotification("Profile Successfully Synchronized.");
                    if (window.API.syncCustomer) {
                        await window.API.syncCustomer({
                            ...user,
                            user_metadata: { ...user.user_metadata, full_name: name, phone: phone }
                        });
                    }
                    setTimeout(() => location.reload(), 1500);
                }

                btn.innerText = originalText;
                btn.disabled = false;
            });

            // Address Sync
            document.getElementById('address-form')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = e.target.querySelector('button[type="submit"]');
                btn.disabled = true;

                const address = {
                    address_line1: document.getElementById('addr-1').value,
                    city: document.getElementById('addr-city').value,
                    zip_code: document.getElementById('addr-zip').value
                };

                await window.API.saveAddress(address);
                window.Storefront.pushNotification("Shipping destination archived.");

                document.getElementById('address-form-container').style.display = 'none';
                this.loadAddresses();

                btn.disabled = false;
                e.target.reset();
            });
        }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => profile.init());
    else profile.init();
})();
