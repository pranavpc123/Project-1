// New order creation - similar to menu.js but simplified
class Cart {
    constructor() {
        this.items = this.loadCart();
    }

    loadCart() {
        const cart = sessionStorage.getItem('newOrderCart');
        return cart ? JSON.parse(cart) : [];
    }

    saveCart() {
        sessionStorage.setItem('newOrderCart', JSON.stringify(this.items));
    }

    addItem(itemId, quantity = 1) {
        const item = ItemManager.getItemById(itemId);
        if (!item) return;

        const existingItem = this.items.find(cartItem => cartItem.id === itemId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: quantity
            });
        }
        this.saveCart();
        this.updateCartUI();
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartUI();
    }

    updateQuantity(itemId, quantity) {
        if (quantity <= 0) {
            this.removeItem(itemId);
            return;
        }
        const item = this.items.find(cartItem => cartItem.id === itemId);
        if (item) {
            item.quantity = quantity;
            this.saveCart();
            this.updateCartUI();
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    clear() {
        this.items = [];
        this.saveCart();
        this.updateCartUI();
    }

    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (cartCount) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }

        if (cartItems) {
            if (this.items.length === 0) {
                cartItems.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">Cart is empty</p>';
                if (checkoutBtn) checkoutBtn.disabled = true;
            } else {
                cartItems.innerHTML = this.items.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p class="item-price">₹${item.price} × ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                            <button class="remove-btn" onclick="cart.removeItem('${item.id}')">Remove</button>
                        </div>
                    </div>
                `).join('');
                if (checkoutBtn) checkoutBtn.disabled = false;
            }
        }

        if (cartTotal) {
            cartTotal.textContent = this.getTotal().toFixed(2);
        }
    }

    placeOrder() {
        if (this.items.length === 0) {
            alert('Please add items to cart first');
            return;
        }

        const orders = this.getOrders();
        const orderData = {
            id: Date.now().toString(),
            items: this.items,
            total: this.getTotal(),
            timestamp: new Date().toISOString(),
            status: 'pending', // Start with pending status
            paymentStatus: 'pending'
        };
        orders.push(orderData);
        localStorage.setItem(CONFIG.STORAGE_KEYS.ORDERS, JSON.stringify(orders));

        // Clear cart
        this.clear();
        sessionStorage.removeItem('newOrderCart');

        alert('Order placed successfully! Status: Pending');
        window.location.href = 'order-picking.html';
    }

    getOrders() {
        const orders = localStorage.getItem(CONFIG.STORAGE_KEYS.ORDERS);
        return orders ? JSON.parse(orders) : [];
    }
}

// Menu display class
class NewOrderDisplay {
    constructor() {
        this.items = [];
        this.filteredItems = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.init();
    }

    init() {
        this.loadItems();
        this.setupEventListeners();
        this.renderMenu();
        cart.updateCartUI();
    }

    loadItems() {
        this.items = ItemManager.getItems();
        this.filteredItems = this.items;
    }

    setupEventListeners() {
        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
                this.applyFilters();
            });
        });

        // Search
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const clearSearchBtn = document.getElementById('clearSearchBtn');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.searchQuery = searchInput.value.trim();
                this.applyFilters();
                if (clearSearchBtn && this.searchQuery) {
                    clearSearchBtn.style.display = 'inline-block';
                }
            });
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchQuery = searchInput.value.trim();
                    this.applyFilters();
                    if (clearSearchBtn && this.searchQuery) {
                        clearSearchBtn.style.display = 'inline-block';
                    }
                }
            });
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                searchInput.value = '';
                this.searchQuery = '';
                clearSearchBtn.style.display = 'none';
                this.applyFilters();
            });
        }

        // Cart toggle
        const cartToggle = document.getElementById('cartToggle');
        const closeCart = document.getElementById('closeCart');
        const cartOverlay = document.getElementById('cartOverlay');

        if (cartToggle) {
            cartToggle.addEventListener('click', () => this.toggleCart(true));
        }
        if (closeCart) {
            closeCart.addEventListener('click', () => this.toggleCart(false));
        }
        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => this.toggleCart(false));
        }

        // Checkout
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                cart.placeOrder();
            });
        }
    }

    applyFilters() {
        this.filteredItems = this.items.filter(item => {
            const matchesCategory = this.currentCategory === 'all' || item.category === this.currentCategory;
            const matchesSearch = !this.searchQuery || 
                item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(this.searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
        this.renderMenu();
    }

    renderMenu() {
        const menuGrid = document.getElementById('menuGrid');
        const noItems = document.getElementById('noItems');

        if (this.filteredItems.length === 0) {
            if (menuGrid) menuGrid.style.display = 'none';
            if (noItems) {
                noItems.style.display = 'block';
                noItems.innerHTML = this.searchQuery ? 
                    '<p>No orders found matching your search.</p>' : 
                    '<p>No orders found.</p>';
            }
            return;
        }

        if (menuGrid) menuGrid.style.display = 'grid';
        if (noItems) noItems.style.display = 'none';

        if (menuGrid) {
            menuGrid.innerHTML = this.filteredItems.map(item => this.renderMenuItem(item)).join('');
        }
    }

    renderMenuItem(item) {
        const imageUrl = item.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Appam_with_stew.jpg/400px-Appam_with_stew.jpg';
        return `
            <div class="menu-item">
                <div class="menu-item-image">
                    <img src="${imageUrl}" alt="${item.name}" loading="lazy" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Appam_with_stew.jpg/400px-Appam_with_stew.jpg'">
                </div>
                <div class="menu-item-content">
                    <span class="category-badge">${item.category}</span>
                    <h3>${item.name}</h3>
                    <p class="description">${item.description}</p>
                    <p class="price">₹${item.price.toFixed(0)}</p>
                    <button class="add-to-cart-btn" onclick="cart.addItem('${item.id}')">Add to Cart</button>
                </div>
            </div>
        `;
    }

    toggleCart(show) {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');

        if (show) {
            if (cartSidebar) cartSidebar.classList.add('active');
            if (cartOverlay) cartOverlay.classList.add('active');
        } else {
            if (cartSidebar) cartSidebar.classList.remove('active');
            if (cartOverlay) cartOverlay.classList.remove('active');
        }
    }
}

// Initialize
let cart;
let newOrderDisplay;

document.addEventListener('DOMContentLoaded', function() {
    ItemManager.initializeDefaultItems();
    cart = new Cart();
    newOrderDisplay = new NewOrderDisplay();
});
