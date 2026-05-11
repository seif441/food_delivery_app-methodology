
const DeliveryDashboard = {
    driverId: null,
    isAvailable: false, 
    currentView: 'dashboard',
    DELIVERY_FEE: 2.99, 
    todayEarnings: 0.00,
    todayCount: 0,

    init() {
        const user = api.getUser();
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }

        this.driverId = user.id;
        const nameEl = document.getElementById('sidebar-name');
        if(nameEl) nameEl.innerText = user.name || user.username || "Driver";

        this.loadActiveOrders();
        this.loadHistory();
        this.syncStatus();

        setInterval(() => {
            this.loadActiveOrders();
        }, 15000);

        if(window.lucide) lucide.createIcons();
    },

    async syncStatus() {
        try {
            const driver = await api.getDriverProfile(this.driverId);
            this.isAvailable = driver.isAvailable; 

            this.updateStatusUI(this.isAvailable);
        } catch (e) {
            console.error("Failed to sync status:", e);
        }
    },

    switchView(viewName) {
        this.currentView = viewName;
        
        const dashView = document.getElementById('view-dashboard');
        const histView = document.getElementById('view-history');
        const btnDash = document.getElementById('nav-dashboard');
        const btnHist = document.getElementById('nav-history');
        const headerTitle = document.getElementById('header-title');
        const headerDesc = document.getElementById('header-desc');

        if(viewName === 'dashboard') {
            dashView.classList.remove('hidden');
            histView.classList.add('hidden');
            
            if(btnDash) {
                btnDash.className = "w-full flex items-center gap-3 px-4 py-3 bg-orange-50 text-orange-700 rounded-xl font-bold transition-all";
                btnHist.className = "w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-semibold transition-all";
            }
            if(headerTitle) {
                headerTitle.innerText = "Dashboard";
                headerDesc.innerText = "Manage your deliveries and earnings";
            }
            
            this.loadActiveOrders(); 
        } else {
            dashView.classList.add('hidden');
            histView.classList.remove('hidden');
            
            if(btnHist) {
                btnHist.className = "w-full flex items-center gap-3 px-4 py-3 bg-orange-50 text-orange-700 rounded-xl font-bold transition-all";
                btnDash.className = "w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-semibold transition-all";
            }
            if(headerTitle) {
                headerTitle.innerText = "Full History";
                headerDesc.innerText = "View all your past deliveries";
            }

            this.loadHistory(); 
        }
    },

    async getActive() {
        try {
            const res = await fetch(`${API_BASE}/delivery/${this.driverId}/active-orders`, { headers: api.getHeaders() });
            if(!res.ok) throw new Error("Failed to fetch active orders");
            return await res.json();
        } catch(e) { 
            console.error(e);
            return [];
        }
    },

    async getHistory() {
        try {
            const res = await fetch(`${API_BASE}/delivery/${this.driverId}/history`, { headers: api.getHeaders() });
            if(!res.ok) throw new Error("Failed to fetch history");
            return await res.json();
        } catch(e) { 
            console.error(e);
            return []; 
        }
    },

    async sendComplete(orderId) {
        try {
            const res = await fetch(`${API_BASE}/delivery/${this.driverId}/complete/${orderId}`, {
                method: 'PUT',
                headers: api.getHeaders()
            });
            if(!res.ok) throw new Error("Failed to complete order");
            return true;
        } catch(e) {
            console.error(e);
            alert("Error: Could not complete order. Please check your connection.");
            return false;
        }
    },

    async toggleAvailability() {
        this.isAvailable = !this.isAvailable;
        this.updateStatusUI(this.isAvailable);

        try {
            const res = await fetch(`${API_BASE}/delivery/${this.driverId}/toggle-availability`, { 
                method: 'PUT', 
                headers: api.getHeaders() 
            });
            
            if(res.ok) {
                setTimeout(() => this.loadActiveOrders(), 500); 
            } else {
                throw new Error("Failed to toggle");
            }
        } catch(e) {
            console.error("Toggle error:", e);
            this.isAvailable = !this.isAvailable;
            this.updateStatusUI(this.isAvailable);
            alert("Could not update availability. Check connection.");
        }
    },
    async loadActiveOrders() {
        const orders = await this.getActive();
        this.renderActive(orders);
    },

    async loadHistory() {
        const history = await this.getHistory();
        this.renderRecentHistory(history);
        this.renderFullHistory(history);
        this.calcStats(history);
        this.updateStatsUI();
    },

    calcStats(history) {
        if(!history || history.length === 0) {
            this.todayCount = 0;
            this.todayEarnings = 0;
            return;
        }
        
        this.todayCount = history.length;
        this.todayEarnings = this.todayCount * this.DELIVERY_FEE;
    },

    async completeOrder(orderId) {
        if(!confirm("Confirm delivery?")) return;

        const btn = document.getElementById(`btn-complete-${orderId}`);
        if(btn) {
            btn.disabled = true;
            btn.innerHTML = `<i data-lucide="loader" class="w-5 h-5 animate-spin"></i> Processing...`;
            if(window.lucide) lucide.createIcons();
        }

        const success = await this.sendComplete(orderId);
        
        if (success) {
            this.loadActiveOrders();
            this.loadHistory();
        } else {
            if(btn) {
                btn.disabled = false;
                btn.innerHTML = `<span>Swipe to Complete</span><i data-lucide="arrow-right" class="w-5 h-5"></i>`;
                if(window.lucide) lucide.createIcons();
            }
        }
    },

    updateStatsUI() {
        const earningsEl = document.getElementById('stat-earnings');
        const countEl = document.getElementById('stat-count');
        if(earningsEl) earningsEl.innerText = this.todayEarnings.toFixed(2);
        if(countEl) countEl.innerText = this.todayCount;
    },

    updateStatusUI(isOnline) {
        const text = isOnline ? "Online" : "Offline";
        const color = isOnline ? "text-green-600" : "text-gray-500";
        
        const dtToggle = document.getElementById('desktop-toggle');
        const dtText = document.getElementById('desktop-status-text');
        if(dtToggle) { dtToggle.checked = isOnline; dtText.innerText = text; dtText.className = `ml-3 text-sm font-medium ${color}`; }

        const mbToggle = document.getElementById('mobile-toggle');
        const mbText = document.getElementById('mobile-toggle-text');
        const mbBadge = document.getElementById('mobile-status-badge');
        
        if(mbToggle) { mbToggle.checked = isOnline; mbText.innerText = isOnline ? "You are currently online" : "You are currently offline"; }
        if(mbBadge) {
            mbBadge.className = isOnline ? "px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1.5" : "px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center gap-1.5";
            mbBadge.innerHTML = isOnline ? `<span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online` : `<span class="w-2 h-2 rounded-full bg-gray-400"></span> Offline`;
        }
    },

    logout() {
        if(confirm("Sign out?")) {
            api.clearUser();
            window.location.href = 'auth.html';
        }
    },


    renderActive(orders) {
        const container = document.getElementById('active-order-container');
        if(!orders || orders.length === 0) {
            container.innerHTML = `<div class="bg-white rounded-3xl p-8 text-center border border-gray-200 border-dashed"><div class="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"><i data-lucide="coffee" class="w-10 h-10 text-gray-400"></i></div><h3 class="text-xl font-bold text-gray-900">No Active Orders</h3></div>`;
            if(window.lucide) lucide.createIcons();
            return;
        }
        
        const order = orders[0];
        const customer = order.customer || { name: "Guest", phoneNumber: "" };
        
        let fullAddress = "Address not provided";
        let additionalInfo = "";

        if (order.deliveryAddress) {
            const da = order.deliveryAddress;
            fullAddress = `${da.streetAddress}, ${da.city}`;
            if(da.postalCode) fullAddress += ` ${da.postalCode}`;
            if(da.additionalInfo) additionalInfo = da.additionalInfo;
        } else if (customer.addresses && customer.addresses.length > 0) {
            const da = customer.addresses[0];
            fullAddress = `${da.streetAddress}, ${da.city}`;
            if(da.postalCode) fullAddress += ` ${da.postalCode}`;
            if(da.additionalInfo) additionalInfo = da.additionalInfo;
        } else if (customer.address) {
            fullAddress = customer.address;
        }

        container.innerHTML = `
            <div class="bg-white rounded-3xl overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100 animate-slide-up">
                <div class="h-48 w-full bg-map-pattern relative border-b border-gray-100">
                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span class="bg-white/90 backdrop-blur text-green-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-green-100">
                            <i data-lucide="map-pin" class="w-3 h-3 fill-green-600"></i> Destination
                        </span>
                    </div>
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-4">
                         <div class="relative"><div class="w-4 h-4 bg-green-500 rounded-full animate-ping absolute top-0 left-0"></div><i data-lucide="map-pin" class="w-8 h-8 text-green-600 relative z-10 fill-green-600"></i></div>
                    </div>
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">DROP-OFF AT</span>
                                <span class="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Order #${order.id}</span>
                            </div>
                            <h2 class="text-2xl font-extrabold text-gray-900 leading-tight">${customer.name}</h2>
                            <div class="mt-2">
                                <p class="text-gray-700 text-sm font-medium flex items-start gap-2">
                                    <i data-lucide="map-pin" class="w-4 h-4 mt-0.5 shrink-0 text-orange-600"></i> 
                                    ${fullAddress}
                                </p>
                                ${additionalInfo ? `<p class="text-xs text-orange-600 mt-1 ml-6 bg-orange-50 p-2 rounded-lg border border-orange-100"><span class="font-bold">Note:</span> ${additionalInfo}</p>` : ''}
                            </div>
                        </div>
                        <a href="tel:${customer.phoneNumber}" class="bg-green-100 text-green-700 p-3 rounded-full hover:bg-green-200 transition-colors"><i data-lucide="phone" class="w-6 h-6"></i></a>
                    </div>
                    <div class="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3">
                        ${(order.items || []).map(item => `<div class="flex justify-between text-sm"><span class="font-bold text-gray-900">${item.quantity}x</span><span class="text-gray-700 font-medium ml-2 flex-1">${item.product ? item.product.name : 'Item'}</span></div>`).join('')}
                    </div>
                    <button id="btn-complete-${order.id}" onclick="DeliveryDashboard.completeOrder(${order.id})" class="group w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden">
                        <span>Swipe to Complete</span><i data-lucide="arrow-right" class="w-5 h-5 group-hover:translate-x-1 transition-transform"></i>
                    </button>
                </div>
            </div>`;
        if(window.lucide) lucide.createIcons();
    },

    renderRecentHistory(history) {
        const container = document.getElementById('recent-history-list');
        if(!container) return; 
        
        if(!history || history.length === 0) {
            container.innerHTML = `<div class="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center"><p class="text-gray-400 text-sm">No recent activity</p></div>`;
            return;
        }

        container.innerHTML = history.slice(0, 5).map(item => this.createHistoryCard(item)).join('');
        if(window.lucide) lucide.createIcons();
    },

    renderFullHistory(history) {
        const container = document.getElementById('full-history-list');
        if(!container) return;

        if(!history || history.length === 0) {
            container.innerHTML = `<div class="text-center py-10 text-gray-400">No history found.</div>`;
            return;
        }

        container.innerHTML = history.map(item => `
            <div class="bg-white p-4 rounded-xl border border-gray-100 flex flex-col md:grid md:grid-cols-4 md:items-center gap-4 hover:bg-gray-50 transition">
                <div class="flex justify-between md:contents">
                    <div class="md:col-span-1">
                        <span class="md:hidden text-xs text-gray-400 uppercase font-bold">Order ID</span>
                        <div class="font-bold text-gray-900">#${item.id}</div>
                    </div>
                    <div class="md:col-span-1 text-right md:text-left">
                        <span class="md:hidden text-xs text-gray-400 uppercase font-bold">Date</span>
                        <div class="text-sm text-gray-600">${this.formatDate(item.orderDate)}</div>
                    </div>
                </div>
                <div class="flex justify-between items-center md:contents border-t border-gray-50 pt-3 md:border-0 md:pt-0">
                    <div class="md:col-span-1">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            <i data-lucide="check-circle-2" class="w-3 h-3"></i> Delivered
                        </span>
                    </div>
                    <div class="md:col-span-1 text-right">
                        <span class="font-extrabold text-green-600">+$${this.DELIVERY_FEE}</span>
                    </div>
                </div>
            </div>
        `).join('');
        if(window.lucide) lucide.createIcons();
    },

    createHistoryCard(item) {
        return `
            <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow cursor-default animate-slide-up">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><i data-lucide="check" class="w-5 h-5"></i></div>
                    <div>
                        <p class="font-bold text-gray-900 text-sm">Order #${item.id}</p>
                        <p class="text-xs text-gray-500">${this.formatDate(item.orderDate)}</p>
                    </div>
                </div>
                <div class="text-right"><span class="block font-extrabold text-green-600 text-sm">+$${this.DELIVERY_FEE}</span></div>
            </div>
        `;
    },

    formatDate(dateVal) {
        if(!dateVal) return "Unknown Date";
        if(Array.isArray(dateVal)) {
            const time = `${dateVal[3].toString().padStart(2,'0')}:${dateVal[4].toString().padStart(2,'0')}`;
            return `${dateVal[2]}/${dateVal[1]} ${time}`; 
        }
        return new Date(dateVal).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
};

document.addEventListener('DOMContentLoaded', () => DeliveryDashboard.init());