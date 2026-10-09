// DATA LOADERS (Initializing the app) - Fetches the menu list from products.json and saves it to the global variable.
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        const data = await response.json();
        products = data.products;
        
        // If we are on the menu page, update the screen with the loaded data
        if (document.getElementById('product-grid')) {
            filterCatalog();
        }
    } catch (error) {
        console.error("Failed to load products.json", error);
    }
}

// Syncs the local variables with the browser's storage so that your cart, favorites, and history persist even after a refresh.
function loadCart() {
    const saved = localStorage.getItem('lumine_cart');
    cart = saved ? JSON.parse(saved) : [];
    updateCartCount();
}

function loadFavorites() {
    const saved = localStorage.getItem('lumine_favorites');
    favorites = saved ? JSON.parse(saved) : [];
}

function loadOrderHistory() {
    const saved = localStorage.getItem('lumine_order_history');
    orderHistory = saved ? JSON.parse(saved) : [];
}

// ====================== PAYMENT FIELD TOGGLE ======================
function togglePaymentFields() {
    const selected = document.querySelector('input[name="payment"]:checked');
    if (!selected) return;

    const gcashInputs = document.querySelectorAll('.payment-input-gcash');
    const cardInputs = document.querySelectorAll('.payment-input-card');

    if (selected.value === 'gcash') {
        gcashInputs.forEach(input => input.disabled = false);
        cardInputs.forEach(input => input.disabled = true);
    } else if (selected.value === 'card') {
        gcashInputs.forEach(input => input.disabled = true);
        cardInputs.forEach(input => input.disabled = false);
    } else {
        // Cash on Delivery
        gcashInputs.forEach(input => input.disabled = true);
        cardInputs.forEach(input => input.disabled = true);
    }
}

// ====================== LIVE MENU SEARCH & FILTER ENGINE ======================
function selectCategory(category, element) {
    selectedCategoryFilter = category;

    document.querySelectorAll('.category-pill').forEach(btn => {
        btn.classList.remove('bg-pink-500', 'text-white', 'shadow-sm');
        btn.classList.add('bg-gray-50', 'text-gray-500');
    });

    if (element) {
        element.classList.remove('bg-gray-50', 'text-gray-500');
        element.classList.add('bg-pink-500', 'text-white', 'shadow-sm');
    }

    filterCatalog();
}

// CATALOG & FILTERING (Displaying items) - Filters the product list based on the user's selected category.
function filterCatalog() {
    const searchInput = document.getElementById('menu-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const gridContainer = document.getElementById('product-grid');
    const emptyState = document.getElementById('menu-empty-state');
    
    currentPage = 1; 

    if (!gridContainer) return;

    const filteredProducts = products.filter(product => {
        const matchesCategory = (selectedCategoryFilter === 'all' || product.category === selectedCategoryFilter);
        const matchesSearch = product.name.toLowerCase().includes(query) || 
                              product.description.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
    });

    if (filteredProducts.length === 0) {
        gridContainer.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        const paginationContainer = document.getElementById('pagination-controls');
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    renderProductCatalogGrid(filteredProducts);
}

function renderProductCatalogGrid(items) {
    const container = document.getElementById('product-grid');
    const paginationContainer = document.getElementById('pagination-controls');
    if (!container) return;
    
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedItems = items.slice(start, start + itemsPerPage);
    
    container.innerHTML = '';
    paginatedItems.forEach(product => {
        const isFavorited = favorites.some(item => item.id === product.id);
        const card = document.createElement('div');
        card.className = "bg-white rounded-3xl p-5 shadow-sm border border-pink-50/50 hover:shadow-md transition-all flex flex-col justify-between group";
        card.innerHTML = `
            <div class="relative overflow-hidden rounded-2xl mb-4 bg-amber-50">
                <img src="${product.image}" class="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300">
                <button onclick="toggleFavorites(${product.id}); event.stopImmediatePropagation();" 
                        class="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all">
                    <i class="fa-${isFavorited ? 'solid' : 'regular'} fa-heart ${isFavorited ? 'text-red-500' : 'text-gray-400'}"></i>
                </button>
                <span class="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-pink-600 shadow-sm">${product.category}</span>
            </div>
            <div>
                <h3 class="font-bold text-lg text-gray-800">${product.name}</h3>
                <p class="text-xs text-gray-400 mt-1 line-clamp-2">${product.description}</p>
            </div>
            <div class="flex items-center justify-between mt-6">
                <span class="text-2xl font-black text-gray-800">₱${product.price}</span>
                <button onclick="openCustomizationModal(${product.id})" class="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm hover:brightness-110 transition-all">
                    Customize
                </button>
            </div>
        `;
        container.appendChild(card);
    });

    if (paginationContainer) {
        paginationContainer.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = `px-4 py-2 rounded-xl text-xs font-bold transition-all ${currentPage === i ? 'bg-pink-500 text-white' : 'bg-white border text-gray-500 hover:border-pink-300'}`;
            btn.onclick = () => {
                currentPage = i;
                renderProductCatalogGrid(items);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
            paginationContainer.appendChild(btn);
        }
    }
}

// PRODUCT CUSTOMIZATION (The Modal Logic) - Creates and shows a popup (modal) for the user to choose sugar, ice, and add-ons.
function openCustomizationModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const oldModal = document.getElementById('custom-modal');
    if (oldModal) oldModal.remove();

    // Create modal elements dynamically
    const modal = document.createElement('div');
    modal.id = 'custom-modal';
    modal.className = "fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in";
    modal.innerHTML = `
        <div class="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div class="p-6 border-b flex justify-between items-center bg-gradient-to-r from-pink-50 to-purple-50">
                <div>
                    <h3 class="font-bold text-xl text-gray-800">${product.name}</h3>
                    <p class="text-pink-600 font-bold text-sm">Base Cost: ₱${product.price}</p>
                </div>
                <button onclick="document.getElementById('custom-modal').remove()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <div class="p-6 overflow-y-auto space-y-6 flex-1">
                <div>
                    <label class="block font-semibold text-xs uppercase tracking-wider text-gray-400 mb-3">Sugar Level</label>
                    <div class="grid grid-cols-4 gap-2">
                        ${['100%', '70%', '50%', '0%'].map((sugar, idx) => `
                            <label class="cursor-pointer text-center">
                                <input type="radio" name="sugar" value="${sugar}" ${idx === 0 ? 'checked' : ''} class="peer hidden">
                                <div class="py-2 border border-gray-200 rounded-xl peer-checked:border-pink-500 peer-checked:bg-pink-50 peer-checked:text-pink-600 font-semibold text-xs">
                                    ${sugar}
                                </div>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <div>
                    <label class="block font-semibold text-xs uppercase tracking-wider text-gray-400 mb-3">Ice Profile</label>
                    <div class="grid grid-cols-3 gap-2">
                        ${['Regular', 'Less Ice', 'No Ice'].map((ice, idx) => `
                            <label class="cursor-pointer text-center">
                                <input type="radio" name="ice" value="${ice}" ${idx === 0 ? 'checked' : ''} class="peer hidden">
                                <div class="py-2 border border-gray-200 rounded-xl peer-checked:border-pink-500 peer-checked:bg-pink-50 peer-checked:text-pink-600 font-semibold text-xs">
                                    ${ice}
                                </div>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <div>
                    <label class="block font-semibold text-xs uppercase tracking-wider text-gray-400 mb-3">Premium Toppings (+₱15 each)</label>
                    <div class="space-y-2">
                        ${['Tapioca Pearls', 'Nata de Coco', 'Egg Pudding', 'Rock Salt & Cheese'].map(addon => `
                            <label class="flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                <div class="flex items-center gap-3">
                                    <input type="checkbox" name="addons" value="${addon}" class="w-4 h-4 accent-pink-500 rounded">
                                    <span class="font-medium text-xs text-gray-700">${addon}</span>
                                </div>
                                <span class="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold">+₱15</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="p-6 border-t bg-gray-50 flex gap-4 items-center">
                <div class="flex-1">
                    <span class="text-[10px] text-gray-400 font-semibold block uppercase">Total Cost</span>
                    <span id="modal-calculated-price" class="text-2xl font-black text-pink-600">₱${product.price}</span>
                </div>
                <button onclick="commitToCart(${product.id})" class="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:brightness-110 transition-all shadow-sm">
                    Add to Cart
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add listener to update price automatically when checkboxes are clicked
    modal.querySelectorAll('input[name="addons"]').forEach(box => {
        box.addEventListener('change', () => {
            const extraCount = modal.querySelectorAll('input[name="addons"]:checked').length;
            document.getElementById('modal-calculated-price').textContent = `₱${product.price + (extraCount * 15)}`;
        });
    });
}

// Saves the selected customizations to the cart and closes the modal.
function commitToCart(productId) {
    const product = products.find(p => p.id === productId);
    const modal = document.getElementById('custom-modal');
    if (!product || !modal) return;

    // Collect values from radio buttons and checkboxes
    const sugar = modal.querySelector('input[name="sugar"]:checked').value;
    const ice = modal.querySelector('input[name="ice"]:checked').value;
    const addons = Array.from(modal.querySelectorAll('input[name="addons"]:checked')).map(el => el.value);
    
    const finalItemPrice = product.price + (addons.length * 15);
    const configSignature = `${productId}-${sugar}-${ice}-${addons.sort().join(',')}`;

    loadCart();
    // Check if the user already has this exact custom drink in the cart
    const existingCartItem = cart.find(item => item.configSignature === configSignature);

    if (existingCartItem) {
        existingCartItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            configSignature,
            price: finalItemPrice,
            customization: { sugar, ice, addons },
            quantity: 1
        });
    }

    localStorage.setItem('lumine_cart', JSON.stringify(cart));
    updateCartCount();
    modal.remove(); // Close modal
    showToast(`${product.name} customized & added! 🧋`);
}

