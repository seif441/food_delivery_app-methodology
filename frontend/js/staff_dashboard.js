const STAFF_API_BASE = 'https://food-delivery-system-production-a37e.up.railway.app/api/staff';

const StaffDashboard = {
    staffId: null,
    currentFilter: 'all',
    
    init() {
        const user = api.getUser();
        
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }

        this.staffId = user.id; 

        this.updateHeaderName(user.name || user.username || "Chef");
        this.loadProfile();
        this.fetchOrders();
        
        setInterval(() => this.fetchOrders(), 10000);
        
        if(window.lucide) lucide.createIcons();
    },
    async loadProfile() {
        try {
            const staffProfile = await api.getStaffProfile(this.staffId);
            this.updateHeaderName(staffProfile.name || staffProfile.username);
        } catch (e) {
            console.error("Profile load failed");
        }
    },

    updateHeaderName(name) {
        const nameDisplay = document.getElementById('staff-name-display');
        if(nameDisplay && name) {
            nameDisplay.innerText = name;
            nameDisplay.classList.remove('animate-pulse');
        }
    },

    // ORDERS 
    async fetchOrders() {
        try {
            const orders = await api.getStaffOrders(this.staffId);
            this.renderBoard(orders);
        } catch (error) {
            console.error("Orders fetch failed:", error);
        }
    },

    // ANIMATED ACTIONS

    async prepareOrder(orderId) {
        const card = document.getElementById(`ticket-${orderId}`);
        const btn = document.getElementById(`btn-cook-${orderId}`);
        
        // ANIMATION START
        if(btn) {
            btn.innerHTML = `<i data-lucide="flame" class="w-4 h-4 animate-bounce"></i> Igniting...`;
            btn.className = "bg-orange-600 text-white py-2 rounded-lg font-bold text-sm transition w-full shadow-lg shadow-orange-500/50";
            if(window.lucide) lucide.createIcons();
        }

        if(card) {
            card.classList.add('animate-sizzle'); 
            this.spawnSteam(card);
        }

        // 2. DELAY FOR EFFECT, THEN CALL BACKEND
        setTimeout(async () => {
            try {
                await api.prepareOrder(this.staffId, orderId);             
                if(card) {
                    card.classList.remove('animate-sizzle');
                    card.classList.add('animate-scale-out');
                }
                
                
                setTimeout(() => this.fetchOrders(), 200);

            } catch(e) {
                alert("Failed to start cooking. Check connection.");
                this.fetchOrders(); 
            }
        }, 1200);
    },

    async markReady(orderId) {
        const card = document.getElementById(`ticket-${orderId}`);
        if(card) card.classList.add('animate-scale-out');
        
        setTimeout(async () => {
            try {
                await api.markOrderReady(this.staffId, orderId);
                this.fetchOrders();
            } catch(e) {
                alert("Failed to update status.");
                this.fetchOrders();
            }
        }, 200);
    },

    spawnSteam(card) {
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                const steam = document.createElement('div');
                steam.className = 'steam-particle';
                const size = Math.random() * 10 + 10;
                steam.style.width = `${size}px`;
                steam.style.height = `${size}px`;
                steam.style.left = `${Math.random() * 80 + 10}%`;
                steam.style.top = '60%'; 
                
                card.appendChild(steam);
                
                setTimeout(() => steam.remove(), 1000);
            }, i * 150);
        }
    },

    logout() {
        if(confirm("Log out?")) {
            api.clearUser();
            window.location.href = 'auth.html';
        }
    },

    filterView(filter) {
        this.currentFilter = filter;
        ['all', 'pending', 'preparing', 'completed'].forEach(id => {
            const btn = document.getElementById(`btn-${id}`);
            if(!btn) return;
            if (id === filter) btn.className = "px-4 py-2 rounded-lg text-sm font-bold bg-gray-900 text-white transition-colors shadow-md transform scale-105";
            else btn.className = "px-4 py-2 rounded-lg text-sm font-bold bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 transition-colors";
        });
        this.fetchOrders();
    },

    renderBoard(orders) {
        const cols = {
            pending: document.getElementById('col-pending'),
            preparing: document.getElementById('col-preparing'),
            ready: document.getElementById('col-ready')
        };
        
        if(!cols.pending) return;
        Object.values(cols).forEach(el => el.innerHTML = '');

        const counts = { pending: 0, preparing: 0, ready: 0 };

        if(Array.isArray(orders)) {
            orders.forEach(order => {
                const status = (order.status || '').toLowerCase(); 
                let targetCol = null;
                
                if (status === 'pending') { targetCol = cols.pending; counts.pending++; }
                else if (status === 'preparing') { targetCol = cols.preparing; counts.preparing++; }
                else if (status === 'prepared' || status === 'delivered') { targetCol = cols.ready; counts.ready++; }

                let shouldShow = false;
                if (this.currentFilter === 'all') shouldShow = true;
                else if (this.currentFilter === 'pending' && status === 'pending') shouldShow = true;
                else if (this.currentFilter === 'preparing' && status === 'preparing') shouldShow = true;
                else if (this.currentFilter === 'completed' && (status === 'prepared' || status === 'delivered')) shouldShow = true;

                if (shouldShow && targetCol) {
                    targetCol.appendChild(this.createTicket(order));
                }
            });
        }

        const cp = document.getElementById('count-pending');
        const cpr = document.getElementById('count-preparing');
        const cr = document.getElementById('count-ready');
        if(cp) cp.innerText = counts.pending;
        if(cpr) cpr.innerText = counts.preparing;
        if(cr) cr.innerText = counts.ready;
        
        if(window.lucide) lucide.createIcons();
    },

    createTicket(order) {
        let timeDisplay = '--:--';
        if(order.orderDate) {
            if(Array.isArray(order.orderDate)) {
                 const hour = order.orderDate[3].toString().padStart(2, '0');
                 const minute = order.orderDate[4].toString().padStart(2, '0');
                 timeDisplay = `${hour}:${minute}`;
            } else {
                try {
                    const date = new Date(order.orderDate);
                    timeDisplay = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                } catch(e) { timeDisplay = 'Now'; }
            }
        }

        const div = document.createElement('div');
        const statusLower = (order.status || '').toLowerCase();
        
        let borderClass = statusLower === 'pending' ? 'status-border-pending' : 
                          statusLower === 'preparing' ? 'status-border-preparing' : 'status-border-ready';

        let actionsHtml = '';
        if (statusLower === 'pending') {
            actionsHtml = `
                <div class="mt-4">
                    <button id="btn-cook-${order.id}" onclick="StaffDashboard.prepareOrder(${order.id})" class="w-full bg-gray-900 text-white py-2 rounded-lg font-bold text-sm hover:bg-gray-800 transition shadow-lg shadow-gray-200 transform active:scale-95">Start Cook</button>
                </div>`;
        } else if (statusLower === 'preparing') {
            actionsHtml = `
                <div class="mt-4">
                    <button onclick="StaffDashboard.markReady(${order.id})" class="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex justify-center items-center gap-2 transform active:scale-95">
                        <i data-lucide="check" class="w-4 h-4"></i> Ready for Driver
                    </button>
                </div>`;
        } else {
            actionsHtml = `
                <div class="mt-4 text-center">
                    <span class="text-green-600 font-bold text-sm flex items-center justify-center gap-1">
                        <i data-lucide="check-circle" class="w-4 h-4"></i> Assigned to Driver
                    </span>
                </div>`;
        }

        div.id = `ticket-${order.id}`;
        div.className = `bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-slide-up ${borderClass} mb-4 last:mb-0 relative overflow-hidden`;
        
        const itemsHtml = (order.items || []).map(item => `
            <div class="flex justify-between items-center">
                <span class="font-bold text-gray-800 text-lg">${item.quantity}x</span>
                <span class="text-gray-700 font-medium flex-1 ml-3 truncate">
                    ${item.product ? item.product.name : 'Unknown Item'}
                </span>
            </div>
        `).join('');

        div.innerHTML = `
            <div class="flex justify-between items-start mb-3 relative z-10">
                <div>
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Order #${order.id}</span>
                    <div class="text-sm font-medium text-gray-500 flex items-center gap-1 mt-1">
                        <i data-lucide="clock" class="w-3 h-3"></i> ${timeDisplay}
                    </div>
                </div>
                ${order.note ? `<div class="bg-red-50 text-red-600 p-1.5 rounded-lg" title="Note"><i data-lucide="alert-circle" class="w-4 h-4"></i></div>` : ''}
            </div>

            <div class="space-y-2 mb-4 border-t border-b border-gray-50 py-3 relative z-10">${itemsHtml}</div>
            ${order.note ? `<div class="bg-yellow-50 border border-yellow-100 p-3 rounded-lg text-sm text-yellow-800 mb-3 relative z-10"><span class="font-bold">Note:</span> ${order.note}</div>` : ''}
            <div class="relative z-10">${actionsHtml}</div>
        `;
        return div;
    }
};

document.addEventListener('DOMContentLoaded', () => StaffDashboard.init());