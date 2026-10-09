// PROMO CODE ENGINE - Validates selected vouchers and applies discounts.
function applyVoucher() {
    const select = document.getElementById('voucher-select');
    const selectedRate = parseFloat(select.value);
    
    // Special Logic: If selecting the 50% discount (0.50), verify usage limit
    if (selectedRate === 0.50) {
        loadOrderHistory(); 
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // Count how many times the user used this specific discount this month
        const usedThisMonth = orderHistory.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate.getMonth() === currentMonth && 
                   orderDate.getFullYear() === currentYear &&
                   order.discountApplied === 0.50;
        }).length;

        // Limit the 50% discount to 2 uses per month
        if (usedThisMonth >= 2) {
            showToast("Perk Limit Reached: You have already used this 2x this month! 🚫");
            select.value = "0";
            activeDiscountPercent = 0;
            renderCheckoutSummary();
            return;
        }
    }
    
    // Set the discount percentage and refresh the summary display
    activeDiscountPercent = selectedRate * 100;
    renderCheckoutSummary();
}

// SUMMARY RENDERING - Builds the list of items and calculates price breakdowns for the checkout page.
function renderCheckoutSummary() {
    const container = document.getElementById('order-items');
    const subtotalEl = document.getElementById('summary-subtotal');
    const discountRow = document.getElementById('summary-discount-row');
    const discountRateEl = document.getElementById('summary-discount-rate');
    const discountAmountEl = document.getElementById('summary-discount-amount');
    const totalEl = document.getElementById('summary-total');

    if (!container) return; // Exit if the summary area doesn't exist
    loadCart(); // Ensure the latest cart data is ready
    container.innerHTML = '';
    
    // Calculate subtotal from all items in the cart
    let subtotal = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        const addonsText = item.customization.addons.length > 0 ? item.customization.addons.join(', ') : 'None';

        // Add item row to the summary view
        const div = document.createElement('div');
        div.className = "flex gap-4 border-b border-gray-50 pb-4 items-center";
        div.innerHTML = `
            <img src="${item.image}" class="w-12 h-12 object-cover rounded-xl flex-shrink-0">
            <div class="flex-1 min-w-0">
                <div class="font-bold text-xs text-gray-800 truncate">${item.name}</div>
                <div class="text-[10px] text-gray-400 mt-0.5 truncate">🍬 Sugar: ${item.customization.sugar} | 🧊 Ice: ${item.customization.ice}</div>
                <div class="text-[10px] text-gray-400 truncate">🧋 Toppings: ${addonsText}</div>
            </div>
            <div class="text-right flex-shrink-0">
                <span class="font-bold text-xs text-gray-700 block">₱${itemTotal}</span>
                <span class="text-[10px] text-gray-400">Qty: ${item.quantity}</span>
            </div>
        `;
        container.appendChild(div);
    });

    // Calculate final totals based on discount percentage
    const discountAmount = Math.round(subtotal * (activeDiscountPercent / 100));
    const total = Math.max(0, subtotal - discountAmount);

    if (subtotalEl) subtotalEl.textContent = `₱${subtotal}`;
    
    // Update discount UI rows
    if (activeDiscountPercent > 0) {
        if (discountRow) discountRow.classList.remove('hidden');
        if (discountRateEl) discountRateEl.textContent = `${activeDiscountPercent}%`;
        if (discountAmountEl) discountAmountEl.textContent = `₱${discountAmount}`;
    } else {
        if (discountRow) discountRow.classList.add('hidden');
    }

    if (totalEl) totalEl.textContent = `₱${total}`;
}

// PAYMENT COMPLETION - Processes the final order, saves it to history, and redirects to success page.
function completePayment() {
    loadCart();
    if (cart.length === 0) return;

    // Recalculate total to ensure it matches the final display
    let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (activeDiscountPercent > 0) {
        total = Math.max(0, total - Math.round(total * (activeDiscountPercent / 100)));
    }

    // Capture customer information
    const nameInput = document.getElementById('shipping-name');
    const brgy = document.getElementById('address-brgy').value.trim();
    const city = document.getElementById('address-city').value.trim();
    const prov = document.getElementById('address-province').value.trim();
    
    const nameStr = nameInput && nameInput.value.trim() !== "" ? nameInput.value.trim() : "Nadine";
    const orderId = `#LUMINE2026${Math.floor(100000 + Math.random() * 900000)}`;

    // Create the final order object
    const confirmedOrderObj = {
        id: orderId,
        customer: nameStr,
        address: {
            barangay: brgy,
            city: city,
            province: prov
        },
        items: JSON.parse(JSON.stringify(cart)),
        total: total,
        discountApplied: activeDiscountPercent / 100, 
        date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Save to LocalStorage for "Success" page and History
    localStorage.setItem('last_order', JSON.stringify(confirmedOrderObj));

    const logsRaw = localStorage.getItem('lumine_order_history');
    const logs = logsRaw ? JSON.parse(logsRaw) : [];
    logs.unshift(confirmedOrderObj);
    localStorage.setItem('lumine_order_history', JSON.stringify(logs));

    // Clear the cart and reset state
    cart = [];
    localStorage.setItem('lumine_cart', '[]');
    activeDiscountPercent = 0; 
    
    // Send user to the confirmation page
    window.location.href = "success.html";
}

