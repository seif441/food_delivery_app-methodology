let state = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    cartId: null,     
    cartItems: [],     
    products: [],     
    categories: [],  
    addresses: [],   
    pendingAction: null, 
    activeCategory: 'all'
};

document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();
    updateHeaderUser();
    
    await loadCategories();
    await loadProducts('all');
    if (state.user) {
        await refreshCart();
        await loadUserAddresses();
    }

    setupEventListeners();
});

async function loadUserAddresses() {
    if (!state.user) return;
    state.addresses = await api.getAddresses(state.user.id);
    updateLocationHeader();
}

function updateLocationHeader() {
    const btn = document.getElementById('header-address-text');
    if (!btn) return;

    if (state.addresses && state.addresses.length > 0) {
        // Show the first address
        const addr = state.addresses[0];
        btn.textContent = `${addr.streetAddress}, ${addr.city}`;
        btn.classList.remove('text-gray-400');
        btn.classList.add('text-gray-700');
    } else {
        btn.textContent = "Set Location";
        btn.classList.add('text-gray-400');
    }
}

function openAddressModal() {
    if (!state.user) return window.location.href = 'auth.html';
    document.getElementById('address-modal').classList.remove('hidden');
}

function closeAddressModal() {
    document.getElementById('address-modal').classList.add('hidden');
}

async function handleAddressSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const payload = {
        streetAddress: formData.get('streetAddress'),
        city: formData.get('city'),
        postalCode: formData.get('postalCode'),
        additionalInfo: formData.get('additionalInfo'),
        user: { id: state.user.id } 
    };

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = "Saving...";
    btn.disabled = true;

    try {
        await api.createAddress(payload);
        await loadUserAddresses(); 
        closeAddressModal();
        form.reset();
        
        if (state.pendingAction === 'checkout') {
            state.pendingAction = null;
            openCartDrawer(); 
            handleCheckout(); 
        }

    } catch (err) {
        alert("Error saving address: " + err.message);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

function updateHeaderUser() {
    const authSection = document.getElementById('nav-auth-section');
    if (!authSection) return;

    if (state.user) {
        authSection.innerHTML = `
            <div class="flex items-center gap-4">
                <span class="text-sm font-bold text-gray-700 hidden md:block">Hi, ${state.user.name}</span>
                <button id="btn-logout" class="flex items-center gap-2 text-gray-500 hover:text-red-500 font-semibold transition">
                    <i data-lucide="log-out" class="w-5 h-5"></i>
                    <span class="hidden md:inline">Logout</span>
                </button>
            </div>
        `;
        document.getElementById('btn-logout').addEventListener('click', logout);
    } else {
        authSection.innerHTML = `
            <a href="auth.html" class="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-semibold transition">
                <i data-lucide="user" class="w-5 h-5"></i>
                <span>Login</span>
            </a>
        `;
    }
    lucide.createIcons();
}

function logout() {
    localStorage.removeItem('user');
    state.user = null;
    state.cartId = null;
    state.cartItems = [];
    state.addresses = [];

    updateHeaderUser();
    updateLocationHeader();
    updateCartUI();
    window.location.href = 'index.html';
}
function updateMobileAuthButton() {
    const mobileAuthBtn = document.getElementById('mobile-auth-btn');
    if (!mobileAuthBtn) return;

    if (state.user) {
        // Case 1: User is Logged In
        // Show "Log Out" text with the specific Log Out icon
        mobileAuthBtn.innerHTML = `
            <i data-lucide="log-out" class="w-6 h-6"></i>
            <span class="text-[10px]">Log Out</span>
        `;
        mobileAuthBtn.onclick = logout; 
    } else {
        // Case 2: User is NOT Logged In
        // Show "Log In" text, but use the PROFILE (user) icon as requested
        mobileAuthBtn.innerHTML = `
            <i data-lucide="user" class="w-6 h-6"></i>
            <span class="text-[10px]">Log In</span>
        `;
        mobileAuthBtn.onclick = () => window.location.href = 'auth.html';
    }
    
    // Refresh the icons so they appear correctly
    if(window.lucide) lucide.createIcons();
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // ... existing init code ...
    updateMobileAuthButton();
});



async function loadCategories() {
    try {
        if (state.categories.length === 0) {
            state.categories = await api.getAllCategories();
        }
        
        const rail = document.getElementById('category-rail');
        if(!rail) return;
        const activeDiv = "bg-orange-500 text-white shadow-orange-200";
        const inactiveDiv = "bg-white border border-gray-100 group-hover:bg-orange-50";
        
        const activeText = "text-orange-600";
        const inactiveText = "text-gray-600 group-hover:text-orange-600";
        rail.innerHTML = `
            <button onclick="loadProducts('all')" class="flex flex-col items-center gap-3 min-w-[80px] group">
                <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-colors ${state.activeCategory === 'all' ? activeDiv : inactiveDiv}">🍽️</div>
                <span class="text-xs font-bold ${state.activeCategory === 'all' ? activeText : inactiveText}">All</span>
            </button>

            ${state.categories.map(cat => `
                <button onclick="loadProducts(${cat.id})" class="flex flex-col items-center gap-3 min-w-[80px] group">
                    <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-colors ${state.activeCategory === cat.id ? activeDiv : inactiveDiv}">
                        ${cat.icon || '🥘'}
                    </div>
                    <span class="text-xs font-bold ${state.activeCategory === cat.id ? activeText : inactiveText}">${cat.name}</span>
                </button>
            `).join('')}
        `;
    } catch(e) { console.error("Error loading categories:", e); }
}

async function loadProducts(catId) {
    state.activeCategory = catId;
    loadCategories(); 

    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    grid.innerHTML = `
        <div class="col-span-full flex justify-center items-center h-full">
            <div class="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full"></div>
        </div>
`;
    
    try {
        const products = catId === 'all' ? await api.getAllProducts() : await api.getProductsByCategory(catId);
        state.products = products;
        
        if(products.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center text-gray-400 animate-fade-in">No items found.</div>';
            return;
        }

        grid.innerHTML = products.map((p, index) => `
            <div 
                onclick="openDetailModal(${p.id})" 
                style="animation-delay: ${index * 100}ms; animation-fill-mode: both;"
                class="animate-slide-up group bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl transition-all border border-gray-100 cursor-pointer hover:-translate-y-1"
            >
                <div class="relative h-48 rounded-2xl overflow-hidden bg-gray-100">
                    <img src="${p.imageUrl || 'https://placehold.co/400'}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onerror="this.src='https://placehold.co/400'">
                    ${!p.available ? '<div class="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold">SOLD OUT</div>' : ''}
                </div>
                <div class="mt-4 px-2 pb-2">
                    <h3 class="font-bold text-lg text-gray-900 leading-tight">${p.name}</h3>
                    <p class="text-sm text-gray-500 mt-1 line-clamp-1">${p.description || ''}</p>
                    <div class="mt-4 flex items-center justify-between">
                        <span class="text-xl font-extrabold text-gray-900">$${p.price.toFixed(2)}</span>
                        <button onclick="event.stopPropagation(); addToCart(${p.id})" class="bg-gray-100 text-gray-900 p-3 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-sm group-hover:shadow-md">
                            <i data-lucide="plus" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    } catch(e) { console.error("Error loading products:", e); }
}


async function refreshCart() {
    if (!state.user) return;
    try {
        const cart = await api.getCartByUser(state.user.id);
        state.cartId = cart.id;
        state.cartItems = cart.items || [];
        
        updateCartUI();
    } catch (e) {
        console.error("Cart sync error:", e);
    }
}

async function addToCart(productId, qty = 1) {
    if (!state.user) return window.location.href = 'auth.html';

    try {
        if (!state.cartId) await refreshCart();

        const updatedCart = await api.addToCart(state.cartId, productId, qty);
        state.cartItems = updatedCart.items;
        updateCartUI();
        
    } catch (e) {
        alert('Failed to add item. Please try again.');
        console.error(e);
    }
}

async function updateCartQty(productId, delta) {
    if (!state.cartId) return;
    const item = state.cartItems.find(i => i.product.id === productId);
    if (!item) return;

    const newQty = item.quantity + delta;
    
    try {
        let updatedCart;
        if (newQty <= 0) {
            updatedCart = await api.removeItemFromCart(state.cartId, productId);
        } else {
            updatedCart = await api.updateCartItem(state.cartId, productId, newQty);
        }
        
        state.cartItems = updatedCart.items;
        updateCartUI();
    } catch (e) {
        console.error("Update qty error", e);
    }
}

function updateCartUI() {
    const total = state.cartItems.reduce((sum, item) => sum + (item.price), 0);
    const count = state.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-badge').forEach(el => {
        el.textContent = count;
        el.classList.toggle('hidden', count === 0);
    });

    const cartContainer = document.getElementById('cart-items-container');
    if (cartContainer) {
        if (state.cartItems.length === 0) {
            cartContainer.innerHTML = `
                <div class="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <i data-lucide="shopping-bag" class="w-12 h-12 text-gray-400 mb-4"></i>
                    <p class="font-bold text-gray-900">Basket is empty</p>
                </div>`;
        } else {
            cartContainer.innerHTML = state.cartItems.map(item => `
                <div class="flex gap-4 mb-4 animate-fade-in">
                    <img src="${item.product.imageUrl || 'https://placehold.co/100'}" class="w-20 h-20 rounded-xl object-cover bg-gray-100" onerror="this.src='https://placehold.co/100'">
                    <div class="flex-1">
                        <div class="flex justify-between items-start mb-1">
                            <h4 class="font-bold text-gray-900 line-clamp-1">${item.product.name}</h4>
                            <span class="font-bold text-gray-900">$${item.price.toFixed(2)}</span>
                        </div>
                        <div class="flex items-center gap-3 bg-gray-50 rounded-lg p-1 w-fit mt-2">
                            <button onclick="updateCartQty(${item.product.id}, -1)" class="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm hover:text-red-500 transition-colors"><i data-lucide="minus" class="w-3 h-3"></i></button>
                            <span class="text-sm font-bold w-4 text-center">${item.quantity}</span>
                            <button onclick="updateCartQty(${item.product.id}, 1)" class="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm hover:text-green-500 transition-colors"><i data-lucide="plus" class="w-3 h-3"></i></button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    if (subtotalEl) subtotalEl.textContent = `$${total.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${(total + 2.99).toFixed(2)}`; // Adding $2.99 Delivery Fee

    lucide.createIcons();
}

function openCartDrawer() {
    document.getElementById('cart-drawer').classList.remove('hidden');
}

function closeCartDrawer() {
    document.getElementById('cart-drawer').classList.add('hidden');
}

async function handleCheckout() {
    if (!state.user) return window.location.href = 'auth.html';
    if (state.cartItems.length === 0) return alert("Your basket is empty!");
    if (!state.addresses || state.addresses.length === 0) {
        state.pendingAction = 'checkout';
        closeCartDrawer();
        openAddressModal();
        return;
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    if(checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = "Processing...";
    }

    try {
        const subtotal = state.cartItems.reduce((sum, item) => sum + item.price, 0);
        const deliveryFee = 2.99;
        
        const orderPayload = {
            customer: { id: state.user.id }, 
            totalPrice: subtotal + deliveryFee,
            status: "PENDING",
            paymentMethod: "CASH_ON_DELIVERY",
            items: state.cartItems.map(item => ({
                product: { id: item.product.id, price: item.product.price }, 
                quantity: item.quantity,
                price: item.price
            }))
        };
        console.log("Sending Order:", orderPayload);
        const createdOrder = await api.placeOrder(orderPayload);
        console.log("Order Created:", createdOrder);

        if (state.cartId) {
            await api.clearCart(state.cartId);
        }

        closeCartDrawer();
        const overlay = document.getElementById('success-overlay');
        if(overlay) {
            overlay.classList.remove('hidden');
        } else {
            alert("Order Placed Successfully!");
        }
        state.cartItems = [];
        updateCartUI();

        setTimeout(() => {
            window.location.href = 'orders.html';
        }, 1500);

    } catch (e) {
        console.error("Checkout Failed:", e);
        alert("Failed to place order: " + e.message);
        if(checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = "Checkout";
        }
    }
}


function openDetailModal(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
    const imgEl = document.getElementById('modal-img');
    imgEl.src = product.imageUrl || 'https://placehold.co/600';
    imgEl.onerror = () => imgEl.src = 'https://placehold.co/600';

    document.getElementById('modal-title').textContent = product.name;
    document.getElementById('modal-desc').textContent = product.description || 'Delicious food ready to be delivered.';
    document.getElementById('modal-price').textContent = `$${product.price.toFixed(2)}`;
    
    const btn = document.getElementById('modal-add-btn');
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.onclick = () => {
        addToCart(product.id, 1);
        closeDetailModal();
    };

    document.getElementById('detail-modal').classList.remove('hidden');
}

function closeDetailModal() {
    document.getElementById('detail-modal').classList.add('hidden');
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById('auth-login-form');
    const registerForm = document.getElementById('auth-register-form');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');

    if (tab === 'login') {
        loginForm?.classList.remove('hidden');
        registerForm?.classList.add('hidden');
        tabLogin?.classList.add('text-orange-600', 'border-b-2', 'border-orange-600');
        tabLogin?.classList.remove('text-gray-400');
        tabRegister?.classList.remove('text-orange-600', 'border-b-2', 'border-orange-600');
        tabRegister?.classList.add('text-gray-400');
    } else {
        loginForm?.classList.add('hidden');
        registerForm?.classList.remove('hidden');
        tabRegister?.classList.add('text-orange-600', 'border-b-2', 'border-orange-600');
        tabRegister?.classList.remove('text-gray-400');
        tabLogin?.classList.remove('text-orange-600', 'border-b-2', 'border-orange-600');
        tabLogin?.classList.add('text-gray-400');
    }
}

function setupEventListeners() {
    const loginForm = document.getElementById('form-login');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            try {
                const user = await api.login(fd.get('email'), fd.get('password'));
                localStorage.setItem('user', JSON.stringify(user));
                state.user = user;
                const role = user.role?.roleName || user.role; 
                if (role === 'ADMIN') window.location.href = 'admin_dashboard.html';
                else if (role === 'STAFF') window.location.href = 'staff_dashboard.html';
                else if (role === 'DELIVERY_STAFF') window.location.href = 'delivery_dashboard.html';
                else window.location.href = 'index.html'; 
                
            } catch(err) { 
                alert(err.message); 
            }
        };
    }

    const registerForm = document.getElementById('form-register');
    if (registerForm) {
        registerForm.onsubmit = async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = Object.fromEntries(fd);
            
            if(data.password.length < 8) return alert("Password must be at least 8 chars");

            try {
                await api.registerCustomer(data);
                alert('Account created! Please login.');
                switchAuthTab('login');
            } catch(err) { 
                alert(err.message); 
            }
        };
    }
    const addressForm = document.getElementById('address-form');
    if(addressForm) {
        addressForm.addEventListener('submit', handleAddressSubmit);
    }
}