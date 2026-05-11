const OrderManager = {
    currentTab: 'active',
    orders: [],
    API_BASE_URL: 'http://localhost:5005/api/orders', 

    init() {
        if (window.lucide) lucide.createIcons();
        this.start();
    },

    async start() {
        const userId = await this.getUserId();
        
        if (userId) {
            this.fetchOrders(userId);
        } else {
            console.warn("No logged-in user found.");
        }
    },

    async getUserId() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                return user.id || user.userId;
            } catch (e) {
                console.error("Session Error:", e);
            }
        }
        return null;
    },

    async fetchOrders(userId) {
        const list = document.getElementById('orders-list');
        const loading = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');

        if (list) list.innerHTML = '';
        if (loading) loading.classList.remove('hidden');
        if (errorState) errorState.classList.add('hidden');

        try {
            const response = await fetch(`${this.API_BASE_URL}/customer/${userId}`);
            
            if (!response.ok) throw new Error(`Server Error (${response.status})`);
            
            this.orders = await response.json();
            this.orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            this.renderOrders(this.currentTab);

        } catch (error) {
            console.error("Error loading orders:", error);
            if (loading) loading.classList.add('hidden');
            if (errorState) errorState.classList.remove('hidden');
        } finally {
            if (loading) loading.classList.add('hidden');
        }
    },

    renderOrders(tab) {
        const list = document.getElementById('orders-list');
        if (!list) return;

        list.innerHTML = ''; 
        const activeStatuses = ['PENDING', 'PREPARED', 'PREPARING', 'OUT_FOR_DELIVERY'];
        const pastStatuses = ['DELIVERED', 'CANCELLED', 'REJECTED'];

        const filteredOrders = this.orders.filter(o => {
            if (tab === 'active') {
                return activeStatuses.includes(o.status);
            } else {
                return pastStatuses.includes(o.status) || !activeStatuses.includes(o.status);
            }
        });

        if (filteredOrders.length === 0) {
            list.innerHTML = `
                <div class="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                    <div class="bg-gray-100 p-6 rounded-full mb-4">
                        <i data-lucide="shopping-bag" class="w-10 h-10 text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-bold text-gray-900">No ${tab} orders found</h3>
                    ${tab === 'active' ? 
                        `<button onclick="window.location.href='index.html'" class="mt-4 bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200">
                            Browse Menu
                        </button>` : ''
                    }
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        filteredOrders.forEach((order) => {
            const items = order.items || [];
            const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
            const itemNames = items.length > 0 
                ? items.map(i => `${i.product ? i.product.name : 'Item'} (x${i.quantity})`).join(', ')
                : "No items details available";

            const canTrack = activeStatuses.includes(order.status);
            const canCancel = order.status === 'PENDING';
            const isCompleted = order.status === 'DELIVERED';

            const card = document.createElement('div');
            card.className = `bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-4 animate-fade-in`;
            let statusColor = "bg-gray-100 text-gray-600";
            if(order.status === 'DELIVERED') statusColor = "bg-green-100 text-green-700 border-green-200";
            if(order.status === 'CANCELLED') statusColor = "bg-red-50 text-red-600 border-red-100";
            if(order.status === 'OUT_FOR_DELIVERY') statusColor = "bg-orange-100 text-orange-700 border-orange-200";

            card.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="font-bold text-gray-900">Order #${order.id}</h3>
                        <p class="text-xs text-gray-500 mt-1">${this.formatDate(order.orderDate)}</p>
                    </div>
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor}">
                        ${order.status.replace(/_/g, ' ')}
                    </span>
                </div>
                
                <div class="py-3 my-3 border-t border-b border-gray-50">
                    <p class="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        <span class="font-medium text-gray-900">${itemCount} items:</span> ${itemNames}
                    </p>
                </div>

                <div class="flex items-center justify-between mt-2">
                    <span class="font-extrabold text-gray-900">$${(order.totalPrice || 0).toFixed(2)}</span>
                    <div class="flex gap-2">
                         ${canCancel ? `
                            <button onclick="OrderManager.cancelOrder(${order.id})" class="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-lg hover:bg-red-100 transition">
                                Cancel
                            </button>
                        ` : ''}
                         ${canTrack ? `
                            <button onclick="window.location.href='track.html?id=${order.id}'" class="px-4 py-2 bg-orange-600 text-white text-sm font-bold rounded-lg hover:bg-orange-700 transition flex items-center gap-2 shadow-lg shadow-orange-100">
                                Track Order
                            </button>
                        ` : ''}
                        ${isCompleted ? `
                             <span class="text-sm font-bold text-green-600 flex items-center gap-1">
                                <i data-lucide="check-circle" class="w-4 h-4"></i> Completed
                             </span>
                        ` : ''}
                    </div>
                </div>
            `;
            list.appendChild(card);
        });
        
        if (window.lucide) lucide.createIcons();
    },

    formatDate(dateVal) {
        if (!dateVal) return '';
        if (Array.isArray(dateVal)) {
            const time = `${dateVal[3].toString().padStart(2,'0')}:${dateVal[4].toString().padStart(2,'0')}`;
            return `${dateVal[2]}/${dateVal[1]}/${dateVal[0]} ${time}`;
        }
        return new Date(dateVal).toLocaleDateString();
    },

    async prepareOrder(orderId) {
        const card = document.getElementById(`ticket-${orderId}`);
        const btn = document.getElementById(`btn-cook-${orderId}`);
        if(btn) {
            btn.innerHTML = `<i data-lucide="flame" class="w-4 h-4 animate-bounce"></i> Igniting...`;
            btn.className = "bg-orange-600 text-white py-2 rounded-lg font-bold text-sm transition w-full shadow-lg shadow-orange-500/50";
            if(window.lucide) lucide.createIcons();
        }
        if(card) {
            card.classList.add('animate-sizzle');
            this.spawnSteam(card);               
        }
        setTimeout(async () => {
            try {
                await api.prepareOrder(this.staffId, orderId);
                
                if(card) {
                    card.classList.remove('animate-sizzle');
                    card.classList.add('animate-scale-out');
                }
                
                setTimeout(() => this.fetchOrders(), 200);
            } catch(e) {
                alert("Failed to start cooking.");
                this.fetchOrders(); 
            }
        }, 1000);
    },
    spawnSteam(card) {
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                const steam = document.createElement('div');
                steam.className = 'steam-particle';
                
                const size = Math.random() * 10 + 10;
                steam.style.width = `${size}px`;
                steam.style.height = `${size}px`;
                steam.style.left = `${Math.random() * 80 + 10}%`; // Random horizontal pos
                steam.style.top = '60%'; 
                
                card.appendChild(steam);
                setTimeout(() => steam.remove(), 1000);
            }, i * 150);
        }
    },
    switchTab(tab) {
        this.currentTab = tab;
        const btnActive = document.getElementById('tab-active');
        const btnPast = document.getElementById('tab-past');
        
        if (tab === 'active') {
            btnActive.classList.replace('text-gray-500', 'text-gray-900');
            btnPast.classList.replace('text-gray-900', 'text-gray-500');
        } else {
            btnPast.classList.replace('text-gray-500', 'text-gray-900');
            btnActive.classList.replace('text-gray-900', 'text-gray-500');
        }
        const indicator = document.getElementById('tab-indicator');
        if (indicator) {
            if (tab === 'active') {
                indicator.style.transform = 'translateX(0)';
            } else {
                indicator.style.transform = 'translateX(100%)'; 
            }
        }
        this.renderOrders(tab);
    },

    async cancelOrder(orderId) {
        if(!confirm("Cancel this order?")) return;
        try {
            const response = await fetch(`${this.API_BASE_URL}/${orderId}`, { method: 'DELETE' });
            if (response.ok) {
                this.start(); 
            } else {
                alert("Could not cancel order.");
            }
        } catch (e) {
            alert("Connection error");
        }
    }
};

document.addEventListener('DOMContentLoaded', () => OrderManager.init());