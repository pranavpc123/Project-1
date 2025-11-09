# Kerala Veg Restaurant Website

A simple restaurant website for Kerala vegetarian foods and snacks built with HTML, CSS, and JavaScript.

## Features

- **Menu Display**: Browse Kerala veg foods and snacks with categories
- **Shopping Cart**: Add items to cart, update quantities, and proceed to payment
- **UPI Payment**: Dynamic QR code generation per order with amount
- **Item Management**: Add, edit, and delete menu items (admin login required)
- **Sales Reports**: View sales statistics with date/time filtering (admin login required)

## Setup Instructions

1. **Configure UPI ID**: 
   - Open `js/config.js`
   - Replace `'your-upi-id@paytm'` with your actual UPI ID
   - Update `UPI_NAME` if needed

2. **Set Admin Password**:
   - Open `js/config.js`
   - Change `ADMIN_PASSWORD` from `'admin123'` to your desired password

3. **Open the Website**:
   - Open `index.html` in a web browser
   - No server required - works directly from file system

## Usage

### For Customers

1. Browse the menu and add items to cart
2. Click the cart icon (bottom right) to view cart
3. Click "Proceed to Payment" to generate UPI QR code
4. Scan the QR code and complete payment
5. Click "Confirm Payment" after completing the transaction

### For Admin

1. Click "Sales Reports" or "Edit Menu" button
2. Enter admin password (default: `admin123`)
3. **To Edit Menu**:
   - Click "Edit Menu" button
   - Click "Edit" on any item to modify it
   - Click "Delete" to remove an item
   - Click "Add New Item" to add a new menu item
   - Click "Cancel Edit" when done

4. **To View Reports**:
   - Click "Sales Reports" button
   - Use filters to view sales by time period
   - View statistics and item-wise sales breakdown

## Default Menu Items

The website comes with sample Kerala veg foods:
- **Foods**: Appam, Puttu, Dosa, Idli, Vegetable Stew
- **Snacks**: Banana Chips, Murukku, Achappam

## Data Storage

- All data is stored in browser's localStorage
- Items and orders persist across browser sessions
- To reset data, clear browser's localStorage

## Browser Compatibility

- Works on all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- QR code generation requires internet connection for CDN library

## File Structure

```
restaurant-app/
├── index.html          # Main menu page
├── payment.html        # Payment page with QR code
├── reports.html        # Sales reports page
├── css/
│   └── style.css      # Stylesheet
├── js/
│   ├── config.js      # Configuration (UPI ID, password)
│   ├── auth.js        # Authentication
│   ├── items.js       # Item management
│   ├── menu.js        # Menu display and cart
│   ├── payment.js     # Payment and QR generation
│   └── reports.js     # Sales reports
└── README.md          # This file
```

## Notes

- UPI QR codes are generated dynamically for each order
- Orders are saved only after payment confirmation
- Admin session expires when browser is closed (sessionStorage)
- All prices are in Indian Rupees (₹)

## Troubleshooting

- **QR Code not displaying**: Check internet connection (requires CDN for QR library)
- **Login not working**: Verify password in `js/config.js`
- **Data not persisting**: Ensure browser allows localStorage
- **Cart not working**: Check browser console for JavaScript errors

