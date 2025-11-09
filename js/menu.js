// Menu display and cart functionality
class Cart {
    constructor() {
        this.items = this.loadCart();
    }

    loadCart() {
        const cart = sessionStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }

    saveCart() {
        sessionStorage.setItem('cart', JSON.stringify(this.items));
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
                cartItems.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">Your cart is empty</p>';
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
}

// Initialize cart
const cart = new Cart();

// Menu display
class MenuDisplay {
    constructor() {
        this.currentCategory = 'all';
        this.editMode = false;
        this.addItemHandlerAttached = false;
        this.searchQuery = '';
        this.init();
    }

    init() {
        this.renderMenu();
        this.setupEventListeners();
        cart.updateCartUI();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const clearSearchBtn = document.getElementById('clearSearchBtn');

        const performSearch = () => {
            const query = searchInput.value.trim().toLowerCase();
            this.searchQuery = query;
            if (query) {
                clearSearchBtn.style.display = 'block';
            } else {
                clearSearchBtn.style.display = 'none';
            }
            this.renderMenu();
        };

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    performSearch();
                }
            });

            searchInput.addEventListener('input', () => {
                // Real-time search as user types
                performSearch();
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                performSearch();
            });
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                searchInput.value = '';
                this.searchQuery = '';
                clearSearchBtn.style.display = 'none';
                this.renderMenu();
            });
        }

        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
                this.renderMenu();
            });
        });

        // Cart toggle
        const cartToggle = document.getElementById('cartToggle');
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        const closeCart = document.getElementById('closeCart');

        const openCart = () => {
            if (cartSidebar) cartSidebar.classList.add('open');
            if (cartOverlay) cartOverlay.classList.add('show');
        };

        const closeCartSidebar = () => {
            if (cartSidebar) cartSidebar.classList.remove('open');
            if (cartOverlay) cartOverlay.classList.remove('show');
        };

        if (cartToggle) {
            cartToggle.addEventListener('click', openCart);
        }

        if (closeCart) {
            closeCart.addEventListener('click', closeCartSidebar);
        }

        // Close cart when clicking overlay
        if (cartOverlay) {
            cartOverlay.addEventListener('click', closeCartSidebar);
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (cart.items.length > 0) {
                    window.location.href = 'payment.html';
                }
            });
        }

        // Edit menu button
        const editMenuBtn = document.getElementById('editMenuBtn');
        if (editMenuBtn) {
            editMenuBtn.addEventListener('click', () => {
                this.toggleEditMode();
            });
        }

        // Add item button - use event delegation since button is created dynamically
        // Use a one-time setup for event delegation
        if (!this.addItemHandlerAttached) {
            document.addEventListener('click', (e) => {
                if (e.target && e.target.id === 'addItemBtn' && !e.target.disabled) {
                    e.preventDefault();
                    this.openItemModal();
                }
            });
            this.addItemHandlerAttached = true;
        }

        // Item form
        const itemForm = document.getElementById('itemForm');
        if (itemForm) {
            itemForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveItem();
            });
        }

        const cancelItemBtn = document.getElementById('cancelItemBtn');
        if (cancelItemBtn) {
            cancelItemBtn.addEventListener('click', () => {
                this.closeItemModal();
            });
        }

        // Close item modal
        const itemModal = document.getElementById('itemModal');
        if (itemModal) {
            itemModal.addEventListener('click', (e) => {
                if (e.target === itemModal) {
                    this.closeItemModal();
                }
            });
        }

        const closeItemModal = itemModal?.querySelector('.close-modal');
        if (closeItemModal) {
            closeItemModal.addEventListener('click', () => {
                this.closeItemModal();
            });
        }

        // Image upload functionality
        const uploadImageBtn = document.getElementById('uploadImageBtn');
        const itemImageFile = document.getElementById('itemImageFile');
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        const removeImageBtn = document.getElementById('removeImageBtn');
        const imageFileName = document.getElementById('imageFileName');
        const itemImageUrl = document.getElementById('itemImageUrl');

        if (uploadImageBtn && itemImageFile) {
            uploadImageBtn.addEventListener('click', () => {
                itemImageFile.click();
            });

            itemImageFile.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Clear URL input when file is selected
                    if (itemImageUrl) itemImageUrl.value = '';
                    
                    // Show file name
                    if (imageFileName) {
                        imageFileName.textContent = file.name;
                    }

                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                        alert('Please select an image file');
                        return;
                    }

                    // Validate file size (max 2MB)
                    if (file.size > 2 * 1024 * 1024) {
                        alert('Image size should be less than 2MB');
                        return;
                    }

                    // Convert to base64
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const base64Image = event.target.result;
                        if (previewImg) {
                            previewImg.src = base64Image;
                            if (imagePreview) {
                                imagePreview.style.display = 'block';
                            }
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Remove image
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', () => {
                if (itemImageFile) itemImageFile.value = '';
                if (imagePreview) imagePreview.style.display = 'none';
                if (previewImg) previewImg.src = '';
                if (imageFileName) imageFileName.textContent = '';
                if (itemImageUrl) itemImageUrl.value = '';
            });
        }

        // Handle URL input change
        if (itemImageUrl) {
            itemImageUrl.addEventListener('input', (e) => {
                const url = e.target.value;
                if (url && url.startsWith('http')) {
                    // Clear file input when URL is entered
                    if (itemImageFile) itemImageFile.value = '';
                    if (imageFileName) imageFileName.textContent = '';
                    if (previewImg) previewImg.src = url;
                    if (imagePreview) imagePreview.style.display = 'block';
                } else if (!url) {
                    if (imagePreview && !itemImageFile.files[0]) {
                        imagePreview.style.display = 'none';
                    }
                }
            });
        }
    }

    renderMenu() {
        const menuGrid = document.getElementById('menuGrid');
        const noItems = document.getElementById('noItems');
        let items = ItemManager.getItems();
        const allItems = items;

        // Update item count display in edit mode
        const itemCountInfo = document.getElementById('itemCountInfo');
        const currentItemCount = document.getElementById('currentItemCount');
        if (this.editMode) {
            if (itemCountInfo && currentItemCount) {
                itemCountInfo.style.display = 'block';
                currentItemCount.textContent = allItems.length;
                if (allItems.length >= 1000) {
                    itemCountInfo.style.background = '#fee2e2';
                    itemCountInfo.style.color = '#991b1b';
                } else {
                    itemCountInfo.style.background = '';
                    itemCountInfo.style.color = '';
                }
            }
        } else {
            if (itemCountInfo) {
                itemCountInfo.style.display = 'none';
            }
        }

        // Filter by category
        if (this.currentCategory !== 'all') {
            items = items.filter(item => item.category === this.currentCategory);
        }

        // Filter by search query
        if (this.searchQuery) {
            items = items.filter(item => {
                const nameMatch = item.name.toLowerCase().includes(this.searchQuery);
                const descMatch = item.description.toLowerCase().includes(this.searchQuery);
                return nameMatch || descMatch;
            });
        }

        if (items.length === 0) {
            if (menuGrid) menuGrid.style.display = 'none';
            if (noItems) noItems.style.display = 'block';
            if (noItems) {
                if (this.searchQuery) {
                    noItems.innerHTML = '<p>No orders found matching your search.</p>';
                } else {
                    noItems.innerHTML = '<p>No orders found. Please add orders to the menu.</p>';
                }
            }
            return;
        }

        if (menuGrid) menuGrid.style.display = 'grid';
        if (noItems) noItems.style.display = 'none';

        if (menuGrid) {
            menuGrid.innerHTML = items.map(item => {
                if (this.editMode) {
                    return this.renderEditItem(item);
                } else {
                    return this.renderMenuItem(item);
                }
            }).join('');
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
                    <h3>${item.name}</h3>
                    <p class="description">${item.description}</p>
                    <div class="item-footer">
                        <p class="price">₹${item.price.toFixed(0)}</p>
                        <button class="btn-add" onclick="cart.addItem('${item.id}', 1)">+ Add</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderEditItem(item) {
        const imageUrl = item.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Appam_with_stew.jpg/400px-Appam_with_stew.jpg';
        return `
            <div class="menu-item edit-mode">
                <div class="menu-item-image">
                    <img src="${imageUrl}" alt="${item.name}" loading="lazy" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Appam_with_stew.jpg/400px-Appam_with_stew.jpg'">
                </div>
                <div class="menu-item-content">
                    <span class="category-badge">${item.category}</span>
                    <h3>${item.name}</h3>
                    <p class="description">${item.description}</p>
                    <p class="price">₹${item.price.toFixed(0)}</p>
                    <div class="edit-actions">
                        <button class="btn-edit" onclick="menuDisplay.openItemModal('${item.id}')">Edit</button>
                        <button class="btn-delete" onclick="menuDisplay.deleteItem('${item.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
        const editMenuBtn = document.getElementById('editMenuBtn');
        if (editMenuBtn) {
            editMenuBtn.textContent = this.editMode ? 'Cancel Edit' : 'Edit Menu';
        }
        this.renderMenu();

        // Show/hide add item button
        let addItemBtn = document.getElementById('addItemBtn');
        const items = ItemManager.getItems();
        const isAtLimit = items.length >= 1000;
        
        if (this.editMode) {
            if (!addItemBtn) {
                addItemBtn = document.createElement('button');
                addItemBtn.id = 'addItemBtn';
                addItemBtn.className = 'btn-primary';
                addItemBtn.textContent = 'Add New Order';
                addItemBtn.style.margin = '20px 0';
                addItemBtn.style.display = 'block';
                addItemBtn.type = 'button';
                const menuGrid = document.getElementById('menuGrid');
                if (menuGrid && menuGrid.parentNode) {
                    menuGrid.parentNode.insertBefore(addItemBtn, menuGrid);
                }
            }
            if (isAtLimit) {
                addItemBtn.disabled = true;
                addItemBtn.textContent = 'Add New Order (Limit: 1000 orders reached)';
                addItemBtn.title = 'Maximum limit of 1000 orders reached. Please delete some orders first.';
            } else {
                addItemBtn.disabled = false;
                addItemBtn.textContent = 'Add New Order';
                addItemBtn.title = '';
            }
            addItemBtn.style.display = 'block';
        } else {
            if (addItemBtn) {
                addItemBtn.style.display = 'none';
            }
        }
    }

    openItemModal(itemId = null) {
        const itemModal = document.getElementById('itemModal');
        const modalTitle = document.getElementById('modalTitle');
        const itemForm = document.getElementById('itemForm');
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        const itemImageFile = document.getElementById('itemImageFile');
        const imageFileName = document.getElementById('imageFileName');
        const itemImageUrl = document.getElementById('itemImageUrl');

        // Reset form and preview
        if (itemForm) itemForm.reset();
        if (imagePreview) imagePreview.style.display = 'none';
        if (previewImg) previewImg.src = '';
        if (imageFileName) imageFileName.textContent = '';
        if (itemImageFile) itemImageFile.value = '';

        if (itemId) {
            // Edit mode
            const item = ItemManager.getItemById(itemId);
            if (item) {
                document.getElementById('itemId').value = item.id;
                document.getElementById('itemName').value = item.name;
                document.getElementById('itemDescription').value = item.description;
                document.getElementById('itemPrice').value = item.price;
                document.getElementById('itemCategory').value = item.category;
                
                // Show existing image
                if (item.image) {
                    if (previewImg) {
                        previewImg.src = item.image;
                        if (imagePreview) {
                            imagePreview.style.display = 'block';
                        }
                    }
                    // If it's a URL, show in URL input, otherwise it's base64
                    if (item.image.startsWith('http')) {
                        if (itemImageUrl) itemImageUrl.value = item.image;
                    }
                }
                
                if (modalTitle) modalTitle.textContent = 'Edit Order';
            }
        } else {
            // Add mode
            document.getElementById('itemId').value = '';
            if (modalTitle) modalTitle.textContent = 'Add Order';
        }

        if (itemModal) {
            itemModal.classList.add('show');
        }
    }

    closeItemModal() {
        const itemModal = document.getElementById('itemModal');
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        const itemImageFile = document.getElementById('itemImageFile');
        const imageFileName = document.getElementById('imageFileName');
        
        if (itemModal) {
            itemModal.classList.remove('show');
            if (document.getElementById('itemForm')) {
                document.getElementById('itemForm').reset();
            }
            // Reset image preview
            if (imagePreview) imagePreview.style.display = 'none';
            if (previewImg) previewImg.src = '';
            if (imageFileName) imageFileName.textContent = '';
            if (itemImageFile) itemImageFile.value = '';
        }
    }

    saveItem() {
        const itemId = document.getElementById('itemId').value;
        const name = document.getElementById('itemName').value;
        const description = document.getElementById('itemDescription').value;
        const price = document.getElementById('itemPrice').value;
        const category = document.getElementById('itemCategory').value;
        const itemImageFile = document.getElementById('itemImageFile');
        const itemImageUrl = document.getElementById('itemImageUrl');
        const previewImg = document.getElementById('previewImg');

        if (!name || !price || !category) {
            alert('Please fill in all required fields for the order');
            return;
        }

        const itemData = { name, description, price, category };
        
        // Get image from preview (which should have the base64 or URL already)
        // Priority: Preview image (from upload or URL) > existing item image
        let imageValue = null;
        
        if (previewImg && previewImg.src && previewImg.src !== '' && previewImg.src !== 'data:,') {
            // Use the preview image which is already base64 (from file upload) or URL
            imageValue = previewImg.src;
        } else if (itemImageUrl && itemImageUrl.value && itemImageUrl.value.trim() !== '') {
            // Fallback to URL input if preview is empty
            imageValue = itemImageUrl.value.trim();
        }
        
        // Only set image if we have a value
        if (imageValue) {
            itemData.image = imageValue;
        }

        if (itemId) {
            // Update existing item - preserve image if no new image provided
            const existingItem = ItemManager.getItemById(itemId);
            if (!imageValue && existingItem && existingItem.image) {
                itemData.image = existingItem.image;
            }
            ItemManager.updateItem(itemId, itemData);
        } else {
            // Add new item
            try {
                ItemManager.addItem(itemData);
            } catch (error) {
                alert(error.message || 'Failed to add order. Maximum limit of 1000 orders reached.');
                return; // Don't close modal if error occurred
            }
        }

        this.closeItemModal();
        this.renderMenu();
    }

    deleteItem(itemId) {
        if (confirm('Are you sure you want to delete this order?')) {
            ItemManager.deleteItem(itemId);
            this.renderMenu();
        }
    }
}

// Initialize menu display
let menuDisplay;
document.addEventListener('DOMContentLoaded', function() {
    menuDisplay = new MenuDisplay();
});

