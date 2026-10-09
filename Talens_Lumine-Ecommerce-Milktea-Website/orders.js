// SUCCESS OVERLAY & CELEBRATION - Triggers a confetti celebration on the success page and displays order details.
function triggerSuccessCelebration() {
    const successIdEl = document.getElementById('success-order-id');
    const successTotalEl = document.getElementById('success-order-total');

    if (!successIdEl) return;

    // Retrieve the last order saved in LocalStorage
    const last = localStorage.getItem('last_order');
    if (last) {
        const order = JSON.parse(last);
        if (successIdEl) successIdEl.textContent = order.id;
        if (successTotalEl) successTotalEl.textContent = `₱${order.total}`;
    }

    // Configure and run the confetti animation
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;
    const config = { startVelocity: 28, spread: 360, ticks: 60, zIndex: 200 };

    const frame = setInterval(() => {
        if (Date.now() > end) return clearInterval(frame);
        confetti(Object.assign({}, config, { origin: { x: Math.random() * 0.2 + 0.1, y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, config, { origin: { x: Math.random() * 0.2 + 0.7, y: Math.random() - 0.2 } }));
    }, 250);
}

// METRICS & LEDGER DASHBOARD - Calculates user statistics like total spent, top toppings, and sugar preferences.
function computeFlavorAndBudgetInsights() {
    const bar = document.getElementById('insights-bar');
    if (!bar) return;

    if (orderHistory.length === 0) {
        bar.classList.add('hidden');
        return;
    }
    bar.classList.remove('hidden');

    let spend = 0, cups = 0;
    const toppingMap = {}, sugarMap = {};

    // Iterate through order history to aggregate metrics
    orderHistory.forEach(order => {
        spend += order.total;
        order.items.forEach(item => {
            cups += item.quantity;
            if (item.customization.addons) {
                item.customization.addons.forEach(a => toppingMap[a] = (toppingMap[a] || 0) + item.quantity);
            }
            if (item.customization.sugar) {
                sugarMap[item.customization.sugar] = (sugarMap[item.customization.sugar] || 0) + item.quantity;
            }
        });
    });

    // Find the most popular topping and sugar preference
    let topTopping = "None";
    let maxT = 0;
    for (const [k, v] of Object.entries(toppingMap)) { if (v > maxT) { maxT = v; topTopping = k; } }

    let topSugar = "100%";
    let maxS = 0;
    for (const [k, v] of Object.entries(sugarMap)) { if (v > maxS) { maxS = v; topSugar = k; } }

    // Update the UI elements
    document.getElementById('stat-total-spent').textContent = `₱${spend}`;
    document.getElementById('stat-total-cups').textContent = cups;
    document.getElementById('stat-top-topping').textContent = topTopping;
    document.getElementById('stat-sugar-profile').textContent = topSugar;
}

// Renders the full list of past orders in the UI.
function renderOrderHistoryPage() {
    const ledger = document.getElementById('ledger-list');
    const grid = document.getElementById('history-grid');
    const empty = document.getElementById('history-empty');

    if (!ledger) return;

    loadOrderHistory();
    computeFlavorAndBudgetInsights();

    // Toggle empty vs. history view
    if (orderHistory.length === 0) {
        if (grid) grid.classList.add('hidden');
        if (empty) empty.classList.remove('hidden');
        return;
    }

    if (grid) grid.classList.remove('hidden');
    if (empty) empty.classList.add('hidden');
    ledger.innerHTML = '';

    // Create a card for each order in history
    orderHistory.forEach((order, idx) => {
        const itemQtyCount = order.items.reduce((s, i) => s + i.quantity, 0);
        const div = document.createElement('div');
        div.id = `order-card-${idx}`;
        div.className = "bg-white p-5 rounded-2xl border-2 border-transparent shadow-sm cursor-pointer hover:border-pink-200 transition-all flex justify-between items-center";
        div.setAttribute('onclick', `selectOrderDetails(${idx})`);
        div.innerHTML = `
            <div>
                <div class="font-mono font-bold text-gray-800 text-base">${order.id}</div>
                <div class="text-[10px] text-gray-400 mt-0.5 font-medium">${order.date} • ${order.time}</div>
                <div class="text-xs text-gray-600 mt-2 font-semibold">${itemQtyCount} ${itemQtyCount === 1 ? 'Cup' : 'Boba Cups'}</div>
            </div>
            <div class="text-right">
                <div class="text-lg font-black text-pink-600">₱${order.total}</div>
                <span class="text-[9px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-200 inline-block mt-1">Settled</span>
            </div>
        `;
        ledger.appendChild(div);
    });

    selectOrderDetails(0); // Select the first order by default
}

// Displays detailed information about a selected order.
function selectOrderDetails(idx) {
    const placeholder = document.getElementById('detail-placeholder');
    const content = document.getElementById('detail-content');
    if (!content) return;

    // Highlight selected card
    document.querySelectorAll('[id^="order-card-"]').forEach(c => c.classList.remove('border-pink-500', 'bg-pink-50/20'));
    const activeCard = document.getElementById(`order-card-${idx}`);
    if (activeCard) activeCard.classList.add('border-pink-500', 'bg-pink-50/20');

    if (placeholder) placeholder.classList.add('hidden');
    content.classList.remove('hidden');

    const order = orderHistory[idx];
    let itemsHTML = '';

    // Build the items list for the detailed view
    order.items.forEach((item, itemIdx) => {
        const addonsText = item.customization.addons.length > 0 ? item.customization.addons.join(', ') : 'None';
        const rating = item.rating || 0;
        
        // Build star rating UI
        let starsHTML = '';
        for (let s = 1; s <= 5; s++) {
            const active = s <= rating;
            starsHTML += `
                <i class="fa-star ${active ? 'fa-solid text-amber-500' : 'fa-regular text-gray-200'} cursor-pointer text-xs"
                   data-order-idx="${idx}" data-item-idx="${itemIdx}" data-star-val="${s}"
                   onmouseover="handleStarHover(this, true)" onmouseout="handleStarHover(this, false)"
                   onclick="submitItemRating(${idx}, ${itemIdx}, ${s})"></i>
            `;
        }

        itemsHTML += `
            <div class="flex gap-4 border-b border-gray-100 pb-4 items-center">
                <img src="${item.image}" class="w-12 h-12 object-cover rounded-xl flex-shrink-0">
                <div class="flex-1 min-w-0">
                    <div class="font-bold text-xs text-gray-800 truncate">${item.name}</div>
                    <div class="text-[10px] text-gray-400 truncate">🍬 Sugar: ${item.customization.sugar} | 🧊 Ice: ${item.customization.ice}</div>
                    <div class="text-[10px] text-gray-400 truncate">🧋 Toppings: ${addonsText}</div>
                    <div class="flex items-center gap-1 mt-1">${starsHTML}</div>
                </div>
                <div class="text-right flex-shrink-0">
                    <div class="font-bold text-xs text-gray-800">₱${item.price * item.quantity}</div>
                    <div class="text-[10px] text-gray-400">Qty: ${item.quantity}</div>
                </div>
            </div>
        `;
    });

    content.innerHTML = `
        <div class="space-y-4">
            <div class="flex justify-between items-start border-b pb-3">
                <div>
                    <h3 class="font-mono text-xl font-bold text-gray-800">${order.id}</h3>
                    <p class="text-[10px] text-gray-400">For <strong>${order.customer}</strong> • ${order.date}</p>
                </div>
                <button onclick="reorderEntireBatch(${idx})" class="bg-purple-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1">Reorder All</button>
            </div>
            <div class="space-y-3 max-h-[280px] overflow-y-auto pr-1">${itemsHTML}</div>
        </div>
        <div class="border-t pt-4 mt-4 bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-3xl flex justify-between items-center">
            <span class="text-xs font-bold text-gray-500">Total Transacted</span>
            <span class="text-2xl font-black text-pink-600">₱${order.total}</span>
        </div>
    `;
}

// Handles visual feedback for star ratings (hover/click).
function handleStarHover(el, over) {
    const parent = el.parentElement;
    const target = parseInt(el.getAttribute('data-star-val'));
    parent.querySelectorAll('i').forEach(star => {
        const v = parseInt(star.getAttribute('data-star-val'));
        if (over) {
            if (v <= target) { star.className = "fa-star fa-solid text-amber-400 cursor-pointer text-xs"; }
        } else {
            const oIdx = parseInt(star.getAttribute('data-order-idx'));
            const iIdx = parseInt(star.getAttribute('data-item-idx'));
            const saved = orderHistory[oIdx].items[iIdx].rating || 0;
            star.className = `fa-star ${v <= saved ? 'fa-solid text-amber-500' : 'fa-regular text-gray-200'} cursor-pointer text-xs`;
        }
    });
}

// Saves a rating to LocalStorage for a specific item.
function submitItemRating(oIdx, iIdx, score) {
    orderHistory[oIdx].items[iIdx].rating = score;
    localStorage.setItem('lumine_order_history', JSON.stringify(orderHistory));
    selectOrderDetails(oIdx);
    showToast(`Rated ${orderHistory[oIdx].items[iIdx].name} ${score} Stars! ⭐`);
}

// Adds items from a past order back into the active cart.
function reorderEntireBatch(idx) {
    const target = orderHistory[idx];
    if (!target) return;

    loadCart();
    target.items.forEach(oldItem => {
        const match = cart.find(c => c.configSignature === oldItem.configSignature);
        if (match) { match.quantity += oldItem.quantity; }
        else { cart.push(JSON.parse(JSON.stringify(oldItem))); }
    });

    localStorage.setItem('lumine_cart', JSON.stringify(cart));
    updateCartCount();
    showToast("Prior batch items queued into active cart! 🛒");
}

function navigateToSection(id) {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
}
