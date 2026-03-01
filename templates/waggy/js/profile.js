/**
 * Enhanced Customer Profile, Orders & Address Management
 */

(function () {
    const profile = {
        async init() {
            console.log("🛠️ Profile Logic Initializing...");

            // Early check for API availability
            if (!window.API) {
                console.error("❌ API not found in profile.js!");
                return;
            }

            // Check auth session
            const user = await window.API.getUser();
            console.log("👤 Current User Session:", user);

            if (!user) {
                console.warn("⚠️ No active session, redirecting to login...");
                window.location.href = 'login.html';
                return;
            }

            // Initialize all UI modules
            this.renderUserInfo(user);
            this.setupTabs();
            this.loadOrders();
            this.loadAddresses();
            this.loadReviews();
            this.bindEvents(user);

            console.log("✅ Profile Initialized Successfully.");
        },

        renderUserInfo(user) {
            const emailEl = document.getElementById('user-email-display');
            const nameEl = document.getElementById('user-name-display');
            const prefName = document.getElementById('pref-name');
            const prefEmail = document.getElementById('pref-email');

            if (emailEl) emailEl.innerText = user.email;
            if (nameEl) nameEl.innerText = user.user_metadata?.full_name || 'Customer Profile';

            // Prefill form
            if (prefEmail) prefEmail.value = user.email;
            if (prefName) prefName.value = user.user_metadata?.full_name || '';
        },

        setupTabs() {
            const btns = document.querySelectorAll('.profile-nav-btn');
            const tabs = document.querySelectorAll('.profile-tab');

            btns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const tabId = btn.dataset.tab;
                    console.log(`📑 Switching to tab: ${tabId}`);

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
            const list = document.getElementById('orders-list');
            if (!list) return;

            try {
                const orders = await window.API.getOrders();

                if (!orders || orders.length === 0) {
                    list.innerHTML = `
                        <div class="p-16 text-center space-y-4 bg-slate-50 rounded-[40px] border border-slate-100">
                            <div class="w-16 h-16 bg-white mx-auto flex items-center justify-center rounded-2xl text-slate-300 shadow-sm">
                                <i data-lucide="package-x" class="w-8 h-8"></i>
                            </div>
                            <p class="font-bold text-slate-400">No transactions recorded yet.</p>
                            <a href="shop.html" class="btn btn-primary h-12 text-xs px-8">Start Shopping</a>
                        </div>
                    `;
                } else {
                    list.innerHTML = orders.map(o => `
                        <div class="p-8 bg-white border border-slate-100 rounded-[40px] shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-center gap-6 group">
                            <div class="flex items-center gap-6">
                                <div class="w-14 h-14 bg-primary/5 text-primary flex items-center justify-center rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors shadow-inner">
                                    <i data-lucide="box" class="w-6 h-6"></i>
                                </div>
                                <div>
                                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order #${o.id.slice(0, 8)}</p>
                                    <p class="text-xl font-black text-slate-800">${new Date(o.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div class="text-center md:text-right px-6 border-x border-slate-50">
                                 <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fulfillment</p>
                                 <span class="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${o.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-amber-50 text-amber-600'}">
                                    ${o.status}
                                 </span>
                            </div>
                            <div class="text-center md:text-right">
                                 <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
                                 <p class="text-2xl font-black text-primary">${window.Storefront.formatCurrency(o.total_amount)}</p>
                            </div>
                        </div>
                    `).join('');
                }
                lucide.createIcons();
            } catch (err) {
                console.error("Error loading orders:", err);
                list.innerHTML = `<p class="text-red-500 text-center font-bold">Failed to load orders.</p>`;
            }
        },

        async loadAddresses() {
            const list = document.getElementById('addresses-list');
            if (!list) return;

            try {
                const addresses = await window.API.getAddresses();

                if (!addresses || addresses.length === 0) {
                    list.innerHTML = `<div class="col-span-full p-10 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 text-center text-slate-400 font-bold uppercase tracking-widest">No shipping addresses saved.</div>`;
                } else {
                    list.innerHTML = addresses.map(a => `
                        <div class="p-8 bg-white border border-slate-100 rounded-[40px] shadow-sm hover:shadow-lg transition-all space-y-4">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-4 text-primary">
                                    <i data-lucide="map-pin" class="w-5 h-5"></i>
                                    <span class="font-black uppercase tracking-widest text-[10px]">Shipping Destination</span>
                                </div>
                                <span class="text-[10px] font-black text-slate-200">#${a.id.slice(0, 4)}</span>
                            </div>
                            <div class="text-slate-800 font-bold text-lg leading-tight">
                                <p>${a.address_line1}</p>
                                <p class="text-sm text-slate-400">${a.city}, ${a.zip_code}</p>
                            </div>
                        </div>
                    `).join('');
                }
                lucide.createIcons();
            } catch (err) {
                console.error("Error loading addresses:", err);
            }
        },

        async loadReviews() {
            const list = document.getElementById('reviews-list');
            if (!list) return;
            // Placeholder logic for reviews if stored in DB
            console.log("Reviews module ready.");
        },

        bindEvents(user) {
            // Logout
            const logoutBtns = [
                document.getElementById('logout-btn-header'),
                document.getElementById('logout-btn-side')
            ];

            logoutBtns.forEach(btn => {
                btn?.addEventListener('click', async () => {
                    console.log("👋 Logging out...");
                    await window.API.logout();
                    window.location.href = 'index.html';
                });
            });

            // Update Personal Details
            document.getElementById('details-form')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = e.target.querySelector('button');
                const origText = btn.innerText;

                btn.innerText = 'Synchronizing...';
                btn.disabled = true;

                const newName = document.getElementById('pref-name').value;
                const newPhone = document.getElementById('pref-phone').value;

                // Call API 
                const { error } = await window.supabase.auth.updateUser({
                    data: { full_name: newName, phone: newPhone }
                });

                if (error) {
                    alert("Update error: " + error.message);
                } else {
                    alert("Profile updated successfully!");
                    if (window.API.syncCustomer) {
                        await window.API.syncCustomer({ ...user, user_metadata: { ...user.user_metadata, full_name: newName } });
                    }
                    location.reload();
                }

                btn.innerText = origText;
                btn.disabled = false;
            });

            // Update Address Submit
            document.getElementById('address-form')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const address = {
                    address_line1: document.getElementById('addr-1').value,
                    city: document.getElementById('addr-city').value,
                    zip_code: document.getElementById('addr-zip').value
                };

                const btn = e.target.querySelector('button[type="submit"]');
                btn.disabled = true;

                await window.API.saveAddress(address);
                document.getElementById('address-form-container').style.display = 'none';
                this.loadAddresses();

                btn.disabled = false;
                e.target.reset();
            });
        }
    };

    // Ensure initialization happens
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => profile.init());
    } else {
        profile.init();
    }
})();
