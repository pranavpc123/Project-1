// Sales reports functionality
class SalesReports {
    constructor() {
        this.orders = [];
        this.filteredOrders = [];
        this.init();
    }

    init() {
        this.loadOrders();
        this.setupEventListeners();
        this.applyFilters();
    }

    loadOrders() {
        const ordersData = localStorage.getItem(CONFIG.STORAGE_KEYS.ORDERS);
        this.orders = ordersData ? JSON.parse(ordersData) : [];
        this.orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    setupEventListeners() {
        const timePeriodFilter = document.getElementById('timePeriodFilter');
        const customDateRange = document.getElementById('customDateRange');
        const applyFilterBtn = document.getElementById('applyFilterBtn');

        if (timePeriodFilter) {
            timePeriodFilter.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    customDateRange.style.display = 'flex';
                } else {
                    customDateRange.style.display = 'none';
                }
            });
        }

        if (applyFilterBtn) {
            applyFilterBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }
    }

    applyFilters() {
        const timePeriod = document.getElementById('timePeriodFilter').value;
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;

        let filtered = [...this.orders];

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        switch (timePeriod) {
            case 'today':
                filtered = filtered.filter(order => {
                    const orderDate = new Date(order.timestamp);
                    return orderDate >= today;
                });
                break;
            case 'week':
                filtered = filtered.filter(order => {
                    const orderDate = new Date(order.timestamp);
                    return orderDate >= weekAgo;
                });
                break;
            case 'month':
                filtered = filtered.filter(order => {
                    const orderDate = new Date(order.timestamp);
                    return orderDate >= monthAgo;
                });
                break;
            case 'custom':
                if (dateFrom && dateTo) {
                    const from = new Date(dateFrom);
                    from.setHours(0, 0, 0, 0);
                    const to = new Date(dateTo);
                    to.setHours(23, 59, 59, 999);
                    filtered = filtered.filter(order => {
                        const orderDate = new Date(order.timestamp);
                        return orderDate >= from && orderDate <= to;
                    });
                }
                break;
        }

        this.filteredOrders = filtered;
        this.displayReports();
    }

    displayReports() {
        this.displayStatistics();
        this.displayItemWiseSales();
        this.displayOrders();
    }

    displayStatistics() {
        const totalSales = this.filteredOrders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = this.filteredOrders.length;
        const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        document.getElementById('totalSales').textContent = totalSales.toFixed(2);
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('avgOrderValue').textContent = avgOrderValue.toFixed(2);
    }

    displayItemWiseSales() {
        const itemSales = {};

        this.filteredOrders.forEach(order => {
            order.items.forEach(item => {
                if (!itemSales[item.id]) {
                    itemSales[item.id] = {
                        name: item.name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                itemSales[item.id].quantity += item.quantity;
                itemSales[item.id].revenue += item.price * item.quantity;
            });
        });

        const itemSalesArray = Object.values(itemSales).sort((a, b) => b.revenue - a.revenue);

        const tbody = document.getElementById('itemSalesBody');
        if (tbody) {
            if (itemSalesArray.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #6b7280;">No sales data available</td></tr>';
            } else {
                tbody.innerHTML = itemSalesArray.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>₹${item.revenue.toFixed(2)}</td>
                    </tr>
                `).join('');
            }
        }
    }

    displayOrders() {
        const tbody = document.getElementById('ordersBody');
        if (tbody) {
            if (this.filteredOrders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #6b7280;">No orders found</td></tr>';
            } else {
                tbody.innerHTML = this.filteredOrders.map(order => {
                    const date = new Date(order.timestamp);
                    const dateStr = date.toLocaleDateString('en-IN');
                    const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                    const itemsList = order.items.map(item => `${item.name} (${item.quantity})`).join(', ');
                    const status = order.status || 'pending';
                    const statusLabel = this.getStatusLabel(status);
                    const statusClass = `status-${status}`;

                    return `
                        <tr>
                            <td>#${order.id.substring(0, 8)}</td>
                            <td>${dateStr} ${timeStr}</td>
                            <td>${itemsList}</td>
                            <td>₹${order.total.toFixed(2)}</td>
                            <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                        </tr>
                    `;
                }).join('');
            }
        }
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
}

// Initialize reports
document.addEventListener('DOMContentLoaded', function() {
    const reports = new SalesReports();
});

