// Order picking functionality
class OrderPicking {
    constructor() {
        this.orders = [];
        this.filteredOrders = [];
        this.currentStatus = 'all';
        this.orderCart = []; // For modal order creation
        this.menuItems = [];
        this.filteredMenuItems = [];
        this.init();
    }

    init() {
        this.loadOrders();
        this.loadMenuItems();
        this.setupEventListeners();
        this.displayOrders();
        
        // Auto-refresh every 10 seconds
        setInterval(() => {
            this.loadOrders();
            this.displayOrders();
        }, 10000);
    }

    loadMenuItems() {
        this.menuItems = ItemManager.getItems();
        this.filteredMenuItems = this.menuItems;
    }

    loadOrders() {
        const ordersData = localStorage.getItem(CONFIG.STORAGE_KEYS.ORDERS);
        this.orders = ordersData ? JSON.parse(ordersData) : [];
        // Sort by newest first
        this.orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    setupEventListeners() {
        const statusFilterBtns = document.querySelectorAll('.status-filter-btn');
        statusFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                statusFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentStatus = btn.dataset.status;
                this.displayOrders();
            });
        });

        // Order creation modal
        const createOrderBtn = document.getElementById('createOrderBtn');
        const closeOrderModal = document.getElementById('closeOrderModal');
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        const orderItemSearch = document.getElementById('orderItemSearch');

        if (createOrderBtn) {
            createOrderBtn.addEventListener('click', () => this.openOrderModal());
        }

        if (closeOrderModal) {
            closeOrderModal.addEventListener('click', () => this.closeOrderModal());
        }

        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', () => this.placeOrder());
        }

        if (orderItemSearch) {
            orderItemSearch.addEventListener('input', (e) => {
                this.filterMenuItems(e.target.value);
            });
        }
    }

    displayOrders() {
        const ordersList = document.getElementById('ordersList');
        const noOrders = document.getElementById('noOrders');

        // Filter orders by status
        let filtered = [...this.orders];
        if (this.currentStatus !== 'all') {
            filtered = filtered.filter(order => {
                const status = order.status || 'pending';
                return status === this.currentStatus;
            });
        }

        if (filtered.length === 0) {
            if (ordersList) ordersList.style.display = 'none';
            if (noOrders) noOrders.style.display = 'block';
            return;
        }

        if (ordersList) ordersList.style.display = 'block';
        if (noOrders) noOrders.style.display = 'none';

        if (ordersList) {
            ordersList.innerHTML = filtered.map(order => this.renderOrder(order)).join('');
        }

        // Attach event listeners to action buttons
        this.attachOrderListeners();
    }

    renderOrder(order) {
        const date = new Date(order.timestamp);
        const dateStr = date.toLocaleDateString('en-IN');
        const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        const status = order.status || 'pending';
        const statusClass = `status-${status}`;
        const statusLabel = this.getStatusLabel(status);

        const itemsList = order.items.map(item => 
            `${item.name} (${item.quantity}x)`
        ).join(', ');

        return `
            <div class="order-card ${statusClass}" data-order-id="${order.id}">
                <div class="order-card-header">
                    <div class="order-info">
                        <h3>Order #${order.id.substring(0, 8)}</h3>
                        <p class="order-time">${dateStr} ${timeStr}</p>
                    </div>
                    <div class="order-status-badge ${statusClass}">
                        ${statusLabel}
                    </div>
                </div>
                <div class="order-card-body">
                    <div class="order-items">
                        <strong>Items:</strong>
                        <ul>
                            ${order.items.map(item => `
                                <li>${item.name} × ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}</li>
                            `).join('')}
                        </ul>
                    </div>
                    <div class="order-total">
                        <strong>Total: ₹${order.total.toFixed(2)}</strong>
                    </div>
                </div>
                <div class="order-card-actions">
                    ${this.getActionButtons(status, order.id)}
                </div>
            </div>
        `;
    }

    getStatusLabel(status) {
        const labels = {
            'pending': 'Pending',
            'preparing': 'Preparing',
            'ready': 'Ready',
            'completed': 'Completed'
        };
        return labels[status] || 'Pending';
    }

    getActionButtons(status, orderId) {
        const buttons = [];
        
        if (status === 'pending') {
            buttons.push(`<button class="btn-action btn-start" data-action="preparing" data-order-id="${orderId}">Start Preparing</button>`);
        }
        
        if (status === 'preparing') {
            buttons.push(`<button class="btn-action btn-ready" data-action="ready" data-order-id="${orderId}">Mark as Ready</button>`);
        }
        
        if (status === 'ready') {
            buttons.push(`<button class="btn-action btn-payment" data-action="payment" data-order-id="${orderId}">Process Payment</button>`);
        }
        
        if (status !== 'completed') {
            buttons.push(`<button class="btn-action btn-cancel" data-action="cancel" data-order-id="${orderId}">Cancel</button>`);
        }

        return buttons.join('');
    }

    attachOrderListeners() {
        const actionButtons = document.querySelectorAll('.btn-action');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                const orderId = btn.dataset.orderId;
                this.handleOrderAction(action, orderId);
            });
        });
    }

    handleOrderAction(action, orderId) {
        const orders = this.orders;
        const orderIndex = orders.findIndex(o => o.id === orderId);
        
        if (orderIndex === -1) return;

        if (action === 'cancel') {
            if (confirm('Are you sure you want to cancel this order?')) {
                orders.splice(orderIndex, 1);
                localStorage.setItem(CONFIG.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
                this.loadOrders();
                this.displayOrders();
            }
            return;
        }

        if (action === 'payment') {
            // Redirect to payment page with order ID
            sessionStorage.setItem('paymentOrderId', orderId);
            window.location.href = 'payment.html';
            return;
        }

        // Update order status
        orders[orderIndex].status = action;
        if (action === 'completed') {
            orders[orderIndex].completedAt = new Date().toISOString();
        }
        
        localStorage.setItem(CONFIG.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        this.loadOrders();
        this.displayOrders();
    }

    // Order creation modal methods
    openOrderModal() {
        this.orderCart = [];
        this.loadMenuItems();
        this.renderMenuItems();
        this.updateOrderSummary();
        const modal = document.getElementById('orderModal');
        if (modal) modal.classList.add('show');
    }

    closeOrderModal() {
        const modal = document.getElementById('orderModal');
        if (modal) modal.classList.remove('show');
        const searchInput = document.getElementById('orderItemSearch');
        if (searchInput) searchInput.value = '';
    }

    filterMenuItems(searchTerm) {
        if (!searchTerm) {
            this.filteredMenuItems = this.menuItems;
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredMenuItems = this.menuItems.filter(item => 
                item.name.toLowerCase().includes(term) || 
                item.description.toLowerCase().includes(term)
            );
        }
        this.renderMenuItems();
    }

    renderMenuItems() {
        const itemsList = document.getElementById('orderItemsList');
        if (!itemsList) return;

        if (this.filteredMenuItems.length === 0) {
            itemsList.innerHTML = '<p style="text-align: center; color: #6b7280;">No items found</p>';
            return;
        }

        itemsList.innerHTML = this.filteredMenuItems.map(item => {
            const cartItem = this.orderCart.find(ci => ci.id === item.id);
            const quantity = cartItem ? cartItem.quantity : 0;
            
            return `
                <div class="order-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 10px; background: white;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 4px 0; font-size: 1rem;">${item.name}</h4>
                        <p style="margin: 0; font-size: 0.875rem; color: #6b7280;">${item.description}</p>
                        <p style="margin: 4px 0 0 0; font-weight: bold; color: #059669;">₹${item.price.toFixed(2)}</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <button class="quantity-btn" onclick="orderPicking.updateOrderItemQuantity('${item.id}', ${quantity - 1})" style="width: 32px; height: 32px; border: 1px solid #d1d5db; background: white; border-radius: 4px; cursor: pointer; font-size: 1.2rem;">-</button>
                        <span style="min-width: 30px; text-align: center; font-weight: bold;">${quantity}</span>
                        <button class="quantity-btn" onclick="orderPicking.updateOrderItemQuantity('${item.id}', ${quantity + 1})" style="width: 32px; height: 32px; border: 1px solid #d1d5db; background: white; border-radius: 4px; cursor: pointer; font-size: 1.2rem;">+</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateOrderItemQuantity(itemId, quantity) {
        if (quantity <= 0) {
            this.orderCart = this.orderCart.filter(item => item.id !== itemId);
        } else {
            const item = this.menuItems.find(i => i.id === itemId);
            if (!item) return;

            const cartItem = this.orderCart.find(ci => ci.id === itemId);
            if (cartItem) {
                cartItem.quantity = quantity;
            } else {
                this.orderCart.push({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: quantity
                });
            }
        }
        this.renderMenuItems();
        this.updateOrderSummary();
    }

    updateOrderSummary() {
        const summaryItems = document.getElementById('orderSummaryItems');
        const totalElement = document.getElementById('orderModalTotal');
        const placeOrderBtn = document.getElementById('placeOrderBtn');

        if (this.orderCart.length === 0) {
            if (summaryItems) summaryItems.innerHTML = '<p style="color: #6b7280;">No items selected</p>';
            if (totalElement) totalElement.textContent = '0.00';
            if (placeOrderBtn) placeOrderBtn.disabled = true;
            return;
        }

        const total = this.orderCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (summaryItems) {
            summaryItems.innerHTML = this.orderCart.map(item => `
                <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                    <span>${item.name} x${item.quantity}</span>
                    <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('');
        }

        if (totalElement) totalElement.textContent = total.toFixed(2);
        if (placeOrderBtn) placeOrderBtn.disabled = false;
    }

    placeOrder() {
        if (this.orderCart.length === 0) {
            alert('Please add items to the order');
            return;
        }

        const total = this.orderCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderData = {
            id: Date.now().toString(),
            items: [...this.orderCart],
            total: total,
            timestamp: new Date().toISOString(),
            status: 'pending',
            paymentStatus: 'pending'
        };

        const orders = this.orders;
        orders.unshift(orderData); // Add to beginning
        localStorage.setItem(CONFIG.STORAGE_KEYS.ORDERS, JSON.stringify(orders));

        this.closeOrderModal();
        this.loadOrders();
        this.displayOrders();

        alert('Order placed successfully! Status: Pending');
    }
}

// Initialize order picking
let orderPicking;
document.addEventListener('DOMContentLoaded', function() {
    ItemManager.initializeDefaultItems();
    orderPicking = new OrderPicking();
});

