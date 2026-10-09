// GLOBAL CART UI UPDATES - calculates the total number of items in the cart and updates the badge on the navigation icon.
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const el = document.getElementById('cart-count');
    if (el) el.textContent = count;
}

// PAGE RENDERING (Building the Cart UI) - clears the existing cart display and reconstructs it based on the data currently in the 'cart' array.
function renderCartPage() {
    const container = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    
    // Stop if we are not on the cart page
    if (!container) return;
    
    loadCart(); // Ensure latest data is loaded
    container.innerHTML = '';
    let total = 0;

    // Handle empty cart state
    if (cart.length === 0) {
        container.innerHTML = `<div class="text-center py-16 text-gray-400 font-medium">Your shopping cart is empty 🛒</div>`;
        if (subtotalEl) subtotalEl.textContent = "₱0";
        if (totalEl) totalEl.textContent = "₱0";
        return;
    }

    // Build items list
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const addonsText = item.customization.addons.length > 0 ? item.customization.addons.join(', ') : 'None';

        const div = document.createElement('div');
        div.className = "flex gap-6 bg-white p-5 rounded-3xl shadow-sm border border-pink-50/50 items-center";
        
        // Generate item HTML structure
        div.innerHTML = `
            <img src="${item.image}" class="w-20 h-20 object-cover rounded-xl flex-shrink-0">
            <div class="flex-1 min-w-0">
                <div class="font-bold text-gray-800 text-base truncate">${item.name}</div>
                <div class="text-[11px] text-gray-400 font-medium space-y-0.5 mt-0.5">
                    <div>🍬 Sugar: <span class="text-gray-600">${item.customization.sugar}</span> | 🧊 Ice: <span class="text-gray-600">${item.customization.ice}</span></div>
                    <div class="truncate">🧋 Toppings: <span class="text-gray-600">${addonsText}</span></div>
                </div>
                <div class="flex items-center justify-between mt-3">
                    <span class="text-pink-600 font-black text-lg">₱${itemTotal}</span>
                    <div class="flex items-center gap-3 border rounded-xl px-2 py-1 bg-gray-50">
                        <button onclick="changeQty(${index}, -1)" class="text-gray-400 hover:text-gray-700 font-bold text-sm px-1">-</button>
                        <span class="font-bold text-xs text-gray-700 w-4 text-center">${item.quantity}</span>
                        <button onclick="changeQty(${index}, 1)" class="text-gray-400 hover:text-gray-700 font-bold text-sm px-1">+</button>
                    </div>
                </div>
            </div>
            <button onclick="removeFromCart(${index})" class="text-gray-300 hover:text-red-500 text-sm p-2 flex-shrink-0"><i class="fa-solid fa-trash-can"></i></button>
        `;
        container.appendChild(div);
    });

    // Finalize totals display
    if (subtotalEl) subtotalEl.textContent = `₱${total}`;
    if (totalEl) totalEl.textContent = `₱${total}`;
}

// 3. DATA MODIFICATION (Updating the Storage) - updates the quantity of an item and refreshes the UI.
/** Updates the quantity of an item and refreshes the UI.
 * @param {number} index - Position in the array.
 * @param {number} change - Value to add (+1 or -1).
 */
function changeQty(index, change) {
    cart[index].quantity = Math.max(1, cart[index].quantity + change);
    localStorage.setItem('lumine_cart', JSON.stringify(cart));
    renderCartPage();
    updateCartCount();
}

// Removes an item from the cart permanently.
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('lumine_cart', JSON.stringify(cart));
    renderCartPage();
    updateCartCount();
}

// NAVIGATION - verifies if the cart has items before allowing the user to checkout.
function checkCartBeforeCheckout() {
    loadCart();
    if (cart.length === 0) {
        alert("Add some delicious boba drinks before proceeding!");
        return;
    }
    window.location.href = "payment.html";
}
