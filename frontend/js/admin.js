let state = {
    activeTab: 'dashboard',
    isSidebarOpen: false,
    modal: { isOpen: false, type: null, item: null, catId: null },
    
    categories: [], 
    products: [],
    staff: [],      
    orders: [],
    logs: [],
 
    stats: [
       { label: 'Total Revenue', value: '$0.00', change: '0%', icon: 'dollar-sign', color: 'bg-emerald-100 text-emerald-600' },
       { label: 'Active Orders', value: '0', change: '0%', icon: 'clock', color: 'bg-orange-100 text-orange-600' },
       { label: 'Pending Delivery', value: '0', change: '0%', icon: 'shopping-bag', color: 'bg-blue-100 text-blue-600' },
       { label: 'Total Staff', value: '0', change: '0%', icon: 'users', color: 'bg-purple-100 text-purple-600' },
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    const user = api.getUser();
    if (!user || (user.role && user.role.roleName !== 'ADMIN')) {
        window.location.href = 'auth.html';
        return;
    }
    loadAllData();
});

async function loadAllData() {
    try {
        const [cats, prods, users, orders, logs] = await Promise.all([
            api.getAllCategories(),
            api.getAllProducts(),
            api.getAllUsers(),
            api.getAllOrders(),
            api.getSystemLogs()
        ]);
        state.products = prods;
        state.categories = cats.map(c => {
            return {
                id: c.id,
                name: c.description || c.name,
                icon: c.icon || '🍽️', 
                products: prods.filter(p => p.category && p.category.id === c.id).map(p => ({
                    ...p,
                    image: p.imageUrl || 'https://via.placeholder.com/300?text=No+Image'
                }))
            };
        });
        state.staff = users.filter(u => u.role && (u.role.roleName === 'STAFF' || u.role.roleName === 'DELIVERY_STAFF' || u.role.roleName === 'ADMIN')).map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role ? u.role.roleName : 'User',
            avatar: u.name ? u.name.substring(0,2).toUpperCase() : 'UR'
        }));

        state.orders = orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)); // Newest first
        state.logs = logs;
        calculateStats();

    } catch (e) { 
        console.error("Data Load Error", e); 
        alert("Failed to load dashboard data. Check console.");
    }

    render();
}

function calculateStats() {
    const revenue = state.orders
        .filter(o => o.status === 'DELIVERED')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    
    state.stats[0].value = `$${revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

    const activeCount = state.orders.filter(o => ['PENDING', 'PREPARING', 'PREPARED', 'OUT_FOR_DELIVERY'].includes(o.status)).length;
    state.stats[1].value = activeCount.toString();

    const deliveryCount = state.orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length;
    state.stats[2].value = deliveryCount.toString();

    state.stats[3].value = state.staff.length.toString();
}

function render() {
    renderSidebar();
    renderHeader();
    renderMainContent();
    if(window.lucide) lucide.createIcons();
}

function renderSidebar() {
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.className = 'nav-item w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-slate-400 hover:bg-slate-800 hover:text-white';
    });
    const activeBtn = document.getElementById('nav-' + state.activeTab);
    if(activeBtn) {
        activeBtn.className = 'nav-item w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/30';
    }
    
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    if (state.isSidebarOpen) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
    } else {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    }
}

function renderHeader() {
    const titles = { dashboard: 'Dashboard Overview', menu: 'Menu Management', orders: 'All Orders', staff: 'Team Members', tracking: 'System Activity Logs' };
    document.getElementById('header-title').innerHTML = `<h2 class="text-xl md:text-2xl font-bold text-gray-900">${titles[state.activeTab]}</h2>`;

    const actionsDiv = document.getElementById('header-actions');
    let actionHtml = '';

    if (state.activeTab === 'menu') {
        actionHtml = `<button onclick="openModal('addCategory')" class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl flex items-center space-x-2 shadow-lg shadow-slate-900/20 transition-all text-sm md:text-base"><i data-lucide="folder-plus" class="w-4 h-4 md:w-5 md:h-5"></i><span class="font-medium hidden md:inline">New Category</span></button>`;
    } 
    else if (state.activeTab === 'staff') {
        actionHtml = `<button onclick="openModal('addStaff')" class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 shadow-lg shadow-orange-600/20 transition-all text-sm md:text-base"><i data-lucide="user-plus" class="w-4 h-4 md:w-5 md:h-5"></i><span class="font-medium hidden md:inline">Add Employee</span></button>`;
    }
    else if (state.activeTab === 'tracking') {
        actionHtml = `<button onclick="loadAllData()" class="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl flex items-center space-x-2 shadow-sm transition-all"><i data-lucide="refresh-cw" class="w-4 h-4"></i><span class="font-medium">Refresh Logs</span></button>`;
    }

    actionHtml += `<div class="h-8 w-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm border-2 border-orange-200">AD</div>`;
    actionsDiv.innerHTML = actionHtml;
}

function renderMainContent() {
    const container = document.getElementById('main-content');
    if (state.activeTab === 'dashboard') container.innerHTML = getDashboardHtml();
    else if (state.activeTab === 'menu') container.innerHTML = getMenuHtml();
    else if (state.activeTab === 'orders') container.innerHTML = getOrdersHtml();
    else if (state.activeTab === 'staff') container.innerHTML = getStaffHtml();
    else if (state.activeTab === 'tracking') container.innerHTML = getTrackingHtml(); // <--- ADD THIS
}

function getDashboardHtml() {
    const statsHtml = state.stats.map(stat => `
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center justify-between hover:shadow-md transition-shadow">
            <div><p class="text-sm font-medium text-gray-500 mb-1">${stat.label}</p><h2 class="text-2xl font-bold text-gray-800">${stat.value}</h2></div>
            <div class="p-3 rounded-full ${stat.color} bg-opacity-20"><i data-lucide="${stat.icon}" class="w-6 h-6"></i></div>
        </div>`).join('');

    const recentOrdersHtml = state.orders.slice(0, 5).map(o => {
        const statusColor = getStatusColor(o.status);
        return `<tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <td class="p-4 font-bold text-gray-700">#${o.id}</td>
            <td class="p-4 text-gray-600">${o.customer ? o.customer.name : 'Guest'}</td>
            <td class="p-4 text-gray-900 font-bold">$${o.totalPrice.toFixed(2)}</td>
            <td class="p-4"><span class="px-2 py-1 rounded text-xs font-bold ${statusColor}">${o.status}</span></td>
        </tr>`;
    }).join('');

    const salesMap = {}; 
    
    if (state.orders && state.orders.length > 0) {
        state.orders.forEach(order => {
            if (order.status !== 'CANCELLED' && order.status !== 'REJECTED' && order.items) {
                order.items.forEach(item => {
                    const product = item.product;
                    if (product && product.id) {
                        if (!salesMap[product.id]) {
                            salesMap[product.id] = {
                                name: product.name,
                                price: product.price,
                                image: product.imageUrl || 'https://via.placeholder.com/150',
                                count: 0
                            };
                        }
                        salesMap[product.id].count += item.quantity;
                    }
                });
            }
        });
    }
    const topSellingProducts = Object.values(salesMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);


    const topSellingHtml = topSellingProducts.length > 0 ? topSellingProducts.map(p => `
        <div class="flex items-center space-x-4 mb-6 last:mb-0 group">
            <div class="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm group-hover:shadow-md transition-all">
                <img src="${p.image}" class="w-full h-full object-cover" alt="${p.name}" onerror="this.src='https://via.placeholder.com/150'">
            </div>
            
            <div class="flex-1 min-w-0">
                <h4 class="text-sm font-bold text-gray-900 truncate">${p.name}</h4>
                <p class="text-xs text-gray-500 font-medium mt-1">${p.count} orders</p>
            </div>
            
            <div class="text-right">
                <span class="text-sm font-bold text-gray-900">$${p.price.toFixed(2)}</span>
            </div>
        </div>
    `).join('') : '<div class="text-center py-8 text-gray-400 text-sm">No sales data recorded yet.</div>';

    return `<div class="space-y-6 animate-fade-in-up">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">${statsHtml}</div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                    <h3 class="font-bold text-gray-800">Recent Activity</h3>
                    <button onclick="switchTab('orders')" class="text-orange-600 text-sm font-medium hover:underline">View All</button>
                </div>
                <div class="overflow-x-auto flex-1">
                    <table class="w-full text-left">
                        <thead class="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th class="p-4">Order ID</th><th class="p-4">Customer</th><th class="p-4">Total</th><th class="p-4">Status</th></tr></thead>
                        <tbody>${recentOrdersHtml || '<tr><td colspan="4" class="p-8 text-center text-gray-400">No orders found.</td></tr>'}</tbody>
                    </table>
                </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col h-full">
                <h3 class="font-bold text-gray-800 mb-6">Top Selling Items</h3>
                <div class="flex-1 overflow-y-auto pr-2">
                    ${topSellingHtml}
                </div>
            </div>
        </div>
    </div>`;
}

function getMenuHtml() {
    if (state.categories.length === 0) {
        return `<div class="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 animate-fade-in-up">
                <div class="bg-gray-50 p-4 rounded-full inline-block mb-4"><i data-lucide="layout-grid" class="w-8 h-8 text-gray-300"></i></div>
                <h3 class="text-lg font-medium text-gray-900">No categories found</h3>
                <button onclick="openModal('addCategory')" class="text-orange-600 font-medium hover:underline mt-2">Create Category</button>
            </div>`;
    }

    return state.categories.map(cat => {
        const productsHtml = cat.products.length === 0 
            ? `<div onclick="openModal('addProduct', null, '${cat.id}')" class="col-span-full py-12 text-center bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200 group hover:border-orange-200 transition-colors cursor-pointer">
                <i data-lucide="plus-circle" class="w-8 h-8 text-gray-300 mx-auto mb-2 group-hover:text-orange-400"></i>
                <p class="text-gray-400 text-sm group-hover:text-orange-600">Add first product to ${cat.name}</p></div>`
            : cat.products.map(p => {
                // REMOVED: const pString = ... (This was causing the error)

                return `<div class="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-orange-100 transition-all duration-300 flex flex-col ${!p.available ? 'opacity-75 grayscale' : ''}">
                    <div class="h-48 w-full bg-gray-100 relative overflow-hidden">
                        <img src="${p.image}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <button onclick="triggerEditProduct('${p.id}', '${cat.id}')" class="text-white text-sm font-medium hover:underline flex items-center">Edit Details <i data-lucide="arrow-right" class="w-3 h-3 ml-1"></i></button>
                        </div>
                        <div class="absolute top-3 right-3"><span class="px-2.5 py-1 rounded-md text-xs font-bold shadow-sm backdrop-blur-md ${p.available ? 'bg-white/90 text-green-700' : 'bg-gray-800/90 text-white'}">${p.available ? 'Active' : 'Hidden'}</span></div>
                    </div>
                    <div class="p-5 flex-1 flex flex-col">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="font-bold text-lg text-gray-800 leading-tight">${p.name}</h3>
                            <span class="font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg text-sm">$${p.price.toFixed(2)}</span>
                        </div>
                        <div class="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                            <button onclick="handleToggleAvailability('${p.id}')" class="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${p.available ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}">
                                <i data-lucide="${p.available ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5"></i> <span>${p.available ? 'Hide' : 'Show'}</span>
                            </button>
                            <div class="flex items-center space-x-1">
                                <button onclick="triggerEditProduct('${p.id}', '${cat.id}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><i data-lucide="pencil" class="w-4 h-4"></i></button>
                                <button onclick="handleDeleteProduct('${p.id}')" class="p-2 text-red-500 hover:bg-red-50 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('');
        
        return `<div class="mb-10 animate-fade-in-up">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <span class="text-3xl">${cat.icon}</span>
                    <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">${cat.name} <span class="text-xs font-semibold bg-gray-200 text-gray-600 px-2.5 py-0.5 rounded-full">${cat.products.length}</span></h3>
                </div>
                <div class="flex items-center bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                    <button onclick="openModal('addProduct', null, '${cat.id}')" class="text-xs font-medium px-3 py-1.5 rounded-md hover:bg-gray-100 text-gray-600 flex items-center gap-1.5"><i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Item</button>
                    <div class="w-px h-4 bg-gray-200 mx-1"></div>
                    <button onclick="handleDeleteCategory('${cat.id}')" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"><i data-lucide="trash" class="w-4 h-4"></i></button>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">${productsHtml}</div>
        </div>`;
    }).join('');
}

function getStaffHtml() {
    const rows = state.staff.map(emp => {
        return `<tr class="group hover:bg-orange-50/30 transition-colors border-b border-gray-100 last:border-0">
            <td class="p-4 pl-6">
                <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white">${emp.avatar}</div>
                    <div><p class="font-semibold text-gray-900">${emp.name}</p><p class="text-xs text-gray-500">${emp.email}</p></div>
                </div>
            </td>
            <td class="p-4"><span style="background:#f3f4f6; padding:2px 8px; border-radius:4px; font-size:0.9em; font-weight:bold;">${emp.role}</span></td>
            <td class="p-4 pr-6 text-right">
                ${emp.role === 'ADMIN' ? '<span class="text-gray-400 text-xs">Protected</span>' : 
                `<button onclick="handleDeleteStaff('${emp.id}')" class="text-gray-400 hover:text-red-600 p-2"><i data-lucide="trash-2" class="w-4 h-4"></i></button>`}
            </td>
        </tr>`;
    }).join('');
    return `<div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
        <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50 border-b border-gray-200"><tr><th class="p-4 pl-6 text-xs font-semibold text-gray-500 uppercase">Employee</th><th class="p-4 text-xs font-semibold text-gray-500 uppercase">Role</th><th class="p-4 pr-6 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th></tr></thead>
            <tbody class="divide-y divide-gray-100">${rows.length ? rows : '<tr><td colspan="3" class="p-10 text-center text-gray-400">No staff found.</td></tr>'}</tbody>
        </table>
    </div>`;
}

function getOrdersHtml() {
    if(state.orders.length === 0) {
        return `<div class="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center"><h3 class="text-lg font-medium text-gray-500">No orders found.</h3></div>`;
    }
    return `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">${state.orders.map(o => {
        const statusColor = getStatusColor(o.status);
        const itemCount = o.items ? o.items.reduce((acc, i) => acc + i.quantity, 0) : 0;
        const time = new Date(o.orderDate).toLocaleString();

        return `<div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4 ${statusColor.includes('green') ? 'border-l-green-500' : (statusColor.includes('orange') ? 'border-l-orange-500' : 'border-l-gray-300')}">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <span class="text-xs font-bold text-gray-400 uppercase">#${o.id}</span>
                    <h3 class="font-bold text-lg text-gray-800">${o.customer ? o.customer.name : 'Guest'}</h3>
                    <p class="text-xs text-gray-500 mt-1">${time}</p>
                </div>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor}">${o.status}</span>
            </div>
            
            <div class="text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded">
                 ${itemCount} Items • ${o.deliveryStaff ? `Driver: ${o.deliveryStaff.name}` : 'No Driver Assigned'}
            </div>

            <div class="flex justify-between items-center pt-4 border-t border-gray-100">
                <span class="font-bold text-xl text-gray-800">$${o.totalPrice.toFixed(2)}</span>
                ${o.status === 'PENDING' ? 
                    `<button onclick="alert('Order is pending kitchen acceptance')" class="text-xs text-gray-400">Waiting for Kitchen</button>` : 
                    `<span class="text-xs text-green-600 font-bold">In Progress</span>`
                }
            </div>
        </div>`;
    }).join('')}</div>`;
}
function getTrackingHtml() {
    if (!state.logs || state.logs.length === 0) {
        return `<div class="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <div class="bg-gray-50 p-4 rounded-full inline-block mb-4"><i data-lucide="activity" class="w-8 h-8 text-gray-300"></i></div>
            <h3 class="text-lg font-medium text-gray-500">No system activity recorded yet.</h3>
        </div>`;
    }

    const rows = state.logs.map(log => {
        let badgeColor = 'bg-gray-100 text-gray-600';
        let icon = 'info';

        if (log.action === 'LOGIN') { badgeColor = 'bg-blue-50 text-blue-600 border border-blue-100'; icon = 'log-in'; }
        else if (log.action === 'ORDER_PLACED') { badgeColor = 'bg-emerald-50 text-emerald-600 border border-emerald-100'; icon = 'shopping-cart'; }
        else if (log.action.includes('KITCHEN')) { badgeColor = 'bg-orange-50 text-orange-600 border border-orange-100'; icon = 'chef-hat'; }
        else if (log.action.includes('DRIVER')) { badgeColor = 'bg-purple-50 text-purple-600 border border-purple-100'; icon = 'truck'; }
        else if (log.action === 'ORDER_DELIVERED') { badgeColor = 'bg-teal-50 text-teal-600 border border-teal-100'; icon = 'check-circle'; }
        else if (log.action === 'ORDER_CANCELLED') { badgeColor = 'bg-red-50 text-red-600 border border-red-100'; icon = 'x-circle'; }
        let user = 'System';
        let role = '-';
        let desc = log.details;

        if (log.action === 'LOGIN') {
            const parts = log.details.split('|');
            if (parts.length >= 2) {
                user = parts[0].replace('User:', '').trim();
                role = parts[1].replace('Role:', '').trim();
                desc = 'Session started successfully';
            }
        } 
        else if (log.action === 'ORDER_PLACED') {
            const match = log.details.match(/placed by (.*?) \|/);
            if (match) user = match[1].trim();
            role = 'CUSTOMER';
            desc = log.details.replace(`placed by ${user} |`, ''); 
        }
        else if (log.action.includes('KITCHEN')) {
            user = 'Kitchen Staff';
            role = 'STAFF';
        }
        else if (log.action === 'DRIVER_ASSIGNED') {
            const parts = log.details.split('Driver:');
            if (parts.length > 1) user = parts[1].trim();
            role = 'DELIVERY_STAFF';
            desc = parts[0].replace('assigned to', '').trim();
        }
        else if (log.action === 'ORDER_DELIVERED') {
            const parts = log.details.split('by');
            if (parts.length > 1) user = parts[1].trim();
            role = 'DELIVERY_STAFF';
            desc = 'Delivery Completed';
        }
        else if (log.action === 'ORDER_CANCELLED') {
            user = 'Customer';
            role = 'CUSTOMER';
        }

        let roleBadgeClass = 'bg-gray-100 text-gray-600 border-gray-200'; // Default

        if (role === 'ADMIN') {
            roleBadgeClass = 'bg-rose-100 text-rose-700 border-rose-200'; // Red for Admin
        } else if (role === 'CUSTOMER') {
            roleBadgeClass = 'bg-sky-100 text-sky-700 border-sky-200';    // Blue for Customer
        } else if (role === 'STAFF') {
            roleBadgeClass = 'bg-orange-100 text-orange-700 border-orange-200'; // Orange for Kitchen
        } else if (role === 'DELIVERY_STAFF') {
            roleBadgeClass = 'bg-violet-100 text-violet-700 border-violet-200'; // Purple for Driver
        }

        return `<tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
            <td class="p-4 whitespace-nowrap text-xs text-gray-400 font-mono">${log.timestamp}</td>
            <td class="p-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${badgeColor}">
                    <i data-lucide="${icon}" class="w-3 h-3"></i> ${log.action}
                </span>
            </td>
            <td class="p-4">
                <div class="font-bold text-sm text-gray-800">${user}</div>
            </td>
            <td class="p-4">
                 <span class="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded border ${roleBadgeClass}">${role}</span>
            </td>
            <td class="p-4 text-sm text-gray-600 truncate max-w-xs" title="${desc}">${desc}</td>
        </tr>`;
    }).join('');

    return `
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in-up">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Time</th>
                        <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">Type</th>
                        <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">User / Agent</th>
                        <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Role</th>
                        <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Activity Details</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    ${rows}
                </tbody>
            </table>
        </div>
    </div>`;
}
function getStatusColor(status) {
    switch(status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-700';
        case 'PREPARING': return 'bg-orange-100 text-orange-700';
        case 'PREPARED': return 'bg-blue-100 text-blue-700';
        case 'OUT_FOR_DELIVERY': return 'bg-purple-100 text-purple-700';
        case 'DELIVERED': return 'bg-green-100 text-green-700';
        default: return 'bg-gray-100 text-gray-700';
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { type, catId, item } = state.modal;

    try {
        if (type === 'addStaff') {
            const role = formData.get('role');
            const staffData = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password')
            };
            staffData.dtype = (role === 'DELIVERY_STAFF') ? "DELIVERY_STAFF" : "STAFF";
            if(role === 'DELIVERY_STAFF') staffData.isAvailable = 0; 

            await api.addStaffMember(staffData, role);
            alert("Staff Added");
        } 
        else if (type === 'addCategory') {
            await api.addCategory(formData.get('catName'), formData.get('icon'));
            alert("Category Added");
        } 
        else if (type === 'addProduct') {
            await api.addProduct({
                name: formData.get('name'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                imageUrl: formData.get('image'),
                categoryId: parseInt(catId),
                available: formData.get('available') === 'on'
            });
            alert("Product Added");
        }
        else if (type === 'editProduct') {
            await api.updateProduct(item.id, {
                name: formData.get('name'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                imageUrl: formData.get('image'),
                categoryId: parseInt(catId),
                available: formData.get('available') === 'on'
            });
            alert("Product Updated");
        }
        closeModal();
        loadAllData(); 
    } catch (err) {
        alert("Operation failed: " + err.message);
    }
}

async function handleDeleteCategory(id) {
    if(!confirm("Delete Category?")) return;
    try { await api.deleteCategory(id); loadAllData(); } catch(e) { alert("Error deleting category"); }
}
async function handleDeleteProduct(id) {
    if(!confirm("Remove Product?")) return;
    try { await api.deleteProduct(id); loadAllData(); } catch(e) { alert("Error deleting product"); }
}
async function handleToggleAvailability(id) {
    try { await api.toggleProductAvailability(id); loadAllData(); } catch(e) { alert("Error updating status"); }
}
async function handleDeleteStaff(id) {
    if(!confirm("Remove User?")) return;
    try { await api.deleteUser(id); loadAllData(); } catch(e) { alert("Error deleting user"); }
}

function switchTab(tab) { state.activeTab = tab; state.isSidebarOpen = false; render(); }
function toggleSidebar() { state.isSidebarOpen = !state.isSidebarOpen; render(); }

function selectIcon(icon, btn) {
    document.getElementById('selectedIconInput').value = icon;
    document.querySelectorAll('.icon-btn').forEach(b => {
        b.classList.remove('bg-orange-100', 'border-orange-500', 'ring-2', 'ring-orange-200');
        b.classList.add('border-gray-200');
    });
    btn.classList.remove('border-gray-200');
    btn.classList.add('bg-orange-100', 'border-orange-500', 'ring-2', 'ring-orange-200');
}

function triggerEditProduct(productId, catId) {
    // 1. Find the product object from the global state using the ID
    // We use == instead of === to match string/number differences
    const product = state.products.find(p => p.id == productId);

    if (product) {
        // 2. Open the modal with the found object
        openModal('editProduct', product, catId);
    } else {
        console.error("Product not found for ID:", productId);
        alert("Error loading product details.");
    }
}

function openModal(type, item = null, catId = null) {
    state.modal = { isOpen: true, type, item, catId };
    const container = document.getElementById('modal-container');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    container.classList.remove('hidden');
    setTimeout(() => { 
        container.classList.remove('opacity-0'); 
        document.getElementById('modal-panel').classList.remove('scale-95');
        document.getElementById('modal-panel').classList.add('scale-100');
    }, 10);

    if(type === 'addStaff') {
        title.innerText = 'Add Employee';
        body.innerHTML = `<form onsubmit="handleFormSubmit(event)" class="space-y-4">
            <div><label class="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label><input name="name" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"></div>
            <div><label class="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label><input name="email" type="email" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"></div>
            <div><label class="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label><input name="password" type="password" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"></div>
            <div><label class="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label><select name="role" class="w-full px-3 py-2 border rounded-lg bg-white"><option value="STAFF">Kitchen Staff</option><option value="DELIVERY_STAFF">Delivery Driver</option></select></div>
            <button type="submit" class="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 mt-2">Create Account</button>
        </form>`;
    } 
    else if (type === 'addCategory') {
        title.innerText = 'New Category';
        const icons = ['🍕', '🍔', '🌮', '🍣', '🥗', '🍩', '🥤', '☕', '🍗', '🍜', '🥪', '🥩'];
        const iconsHtml = icons.map(icon => 
            `<button type="button" onclick="selectIcon('${icon}', this)" class="icon-btn w-10 h-10 text-xl border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center">${icon}</button>`
        ).join('');

        body.innerHTML = `<form onsubmit="handleFormSubmit(event)" class="space-y-4">
            <div><label class="block text-xs font-bold text-gray-500 uppercase mb-1">Category Name</label><input name="catName" required placeholder="e.g. Italian, Drinks" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"></div>
            <div><label class="block text-xs font-bold text-gray-500 uppercase mb-2">Choose Icon</label><div class="grid grid-cols-6 gap-2">${iconsHtml}</div><input type="hidden" name="icon" id="selectedIconInput" value="🍽️"></div>
            <button type="submit" class="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 mt-2">Create Category</button>
        </form>`;
    } 
    else if (type === 'addProduct' || type === 'editProduct') {
        const isEdit = type === 'editProduct';
        title.innerText = isEdit ? 'Edit Product' : 'Add Product';
        const btnText = isEdit ? 'Update Product' : 'Add Product';
        
        const valName = item ? item.name : '';
        const valPrice = item ? item.price : '';
        const valDesc = item ? item.description : '';
        const valImg = item ? item.image : '';
        const valCheck = (item ? item.available : true) ? 'checked' : '';

        body.innerHTML = `<form onsubmit="handleFormSubmit(event)" class="space-y-4">
            <div><label class="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label><input name="name" value="${valName}" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"></div>
            <div><label class="block text-xs font-bold text-gray-500 uppercase mb-1">Price</label><input name="price" type="number" step="0.01" value="${valPrice}" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"></div>
            <div><label class="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label><textarea name="description" rows="2" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none">${valDesc}</textarea></div>
            <div><label class="block text-xs font-bold text-gray-500 uppercase mb-1">Image URL</label><input name="image" value="${valImg}" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"></div>
            <div class="flex items-center space-x-2 pt-2"><input type="checkbox" name="available" id="pAvailable" class="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" ${valCheck}><label for="pAvailable" class="text-sm font-medium text-gray-700">Available immediately</label></div>
            <button type="submit" class="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 mt-2">${btnText}</button>
        </form>`;
    }
}

function closeModal() {
    const container = document.getElementById('modal-container');
    container.classList.add('opacity-0');
    setTimeout(() => container.classList.add('hidden'), 300);
}