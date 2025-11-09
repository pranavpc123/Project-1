// Payment and QR code generation
class Payment {
    constructor() {
        this.existingOrderId = sessionStorage.getItem('paymentOrderId');
        this.order = this.loadOrder();
        this.init();
    }

    loadOrder() {
        // Check if this is for an existing order from order-picking
        if (this.existingOrderId) {
            const orders = this.getOrders();
            const existingOrder = orders.find(o => o.id === this.existingOrderId);
            if (existingOrder) {
                return existingOrder;
            }
        }
        
        // Otherwise load from currentOrder (new customer order)
        const order = sessionStorage.getItem('currentOrder');
        return order ? JSON.parse(order) : null;
    }

    init() {
        if (!this.order || !this.order.items || this.order.items.length === 0) {
            // No order found, redirect to menu
            alert('No order found. Please add items to cart first.');
            window.location.href = 'index.html';
            return;
        }

        this.displayOrderSummary();
        this.generateQRCode();
        this.setupEventListeners();
    }

    displayOrderSummary() {
        const orderSummary = document.getElementById('orderSummary');
        const totalAmount = document.getElementById('totalAmount');

        if (orderSummary) {
            orderSummary.innerHTML = this.order.items.map(item => `
                <div class="order-item">
                    <div>
                        <strong>${item.name}</strong>
                        <p>Quantity: ${item.quantity} × ₹${item.price} = ₹${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
            `).join('');
        }

        if (totalAmount) {
            totalAmount.textContent = this.order.total.toFixed(2);
        }
    }

    generateQRCode() {
        const amount = this.order.total.toFixed(2);
        const upiId = CONFIG.UPI_ID;
        const upiName = CONFIG.UPI_NAME;

        // Generate UPI payment URL
        const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=Restaurant Order`;

        // Clear previous QR code
        const qrcodeContainer = document.getElementById('qrcode');
        if (qrcodeContainer) {
            qrcodeContainer.innerHTML = '';
        }

        // Generate QR code
        if (typeof QRCode !== 'undefined') {
            new QRCode(qrcodeContainer, {
                text: upiUrl,
                width: 256,
                height: 256,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            // Fallback if QRCode library is not loaded
            qrcodeContainer.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <p>QR Code library not loaded. Please scan the UPI ID manually:</p>
                    <p style="font-size: 1.2rem; font-weight: bold; margin-top: 10px;">${upiId}</p>
                    <p style="margin-top: 10px;">Amount: ₹${amount}</p>
                </div>
            `;
        }

        // Display UPI ID
        const upiIdElement = document.getElementById('upiId');
        if (upiIdElement) {
            upiIdElement.textContent = upiId;
        }
    }

    setupEventListeners() {
        const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
        if (confirmPaymentBtn) {
            confirmPaymentBtn.addEventListener('click', () => {
                this.confirmPayment();
            });
        }
    }

    confirmPayment() {
        if (confirm('Have you completed the payment?')) {
            const orders = this.getOrders();
            
            if (this.existingOrderId) {
                // Update existing order status to completed
                const orderIndex = orders.findIndex(o => o.id === this.existingOrderId);
                if (orderIndex !== -1) {
                    orders[orderIndex].status = 'completed';
                    orders[orderIndex].paymentStatus = 'completed';
                    orders[orderIndex].completedAt = new Date().toISOString();
                    localStorage.setItem(CONFIG.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
                }
                
                // Clear session
                sessionStorage.removeItem('paymentOrderId');
                
                // Show success message and redirect to order picking
                alert('Payment confirmed! Order marked as completed.');
                window.location.href = 'order-picking.html';
            } else {
                // Save new order to localStorage
                const orderData = {
                    id: Date.now().toString(),
                    items: this.order.items,
                    total: this.order.total,
                    timestamp: new Date().toISOString(),
                    paymentStatus: 'completed',
                    status: 'pending' // Initial status for order picking
                };
                orders.push(orderData);
                localStorage.setItem(CONFIG.STORAGE_KEYS.ORDERS, JSON.stringify(orders));

                // Clear current order and cart
                sessionStorage.removeItem('currentOrder');
                sessionStorage.removeItem('cart');

                // Show success message and redirect
                alert('Payment confirmed! Thank you for your order.');
                window.location.href = 'index.html';
            }
        }
    }

    getOrders() {
        const orders = localStorage.getItem(CONFIG.STORAGE_KEYS.ORDERS);
        return orders ? JSON.parse(orders) : [];
    }
}

// Load order from cart when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Get cart from sessionStorage
    const cartItems = sessionStorage.getItem('cart');
    if (cartItems) {
        const items = JSON.parse(cartItems);
        if (items.length > 0) {
            const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const order = {
                items: items,
                total: total
            };
            sessionStorage.setItem('currentOrder', JSON.stringify(order));
        }
    }

    // Initialize payment
    const payment = new Payment();
});

