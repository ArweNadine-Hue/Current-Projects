// FAVORITES INTERACTION - This function handles adding or removing a product from the user's favorites list.
function toggleFavorites(id) {
    // Locate the product in the global 'products' array
    const product = products.find(p => p.id === id);
    if (!product) return;

    // Load the current favorites from storage to ensure we have the latest list
    loadFavorites();
    const index = favorites.findIndex(item => item.id === id);
    
    // If not found in favorites, add it; otherwise, remove it
    if (index === -1) {
        favorites.push(product);
        showToast(`${product.name} added to favorites ❤️`);
    } else {
        favorites.splice(index, 1);
        showToast(`${product.name} removed from favorites`);
    }

    // Save the updated list to localStorage
    localStorage.setItem('lumine_favorites', JSON.stringify(favorites));

    // Update the UI if we are on the menu page (filtering catalog) or the favorites page
    if (document.getElementById('product-grid')) filterCatalog();
    if (window.location.pathname.includes('favorites.html')) renderFavoritesPage();
}

// FAVORITES RENDERING - Builds the visual list of favorite items when the user visits the favorites page
function renderFavoritesPage() {
    const container = document.getElementById('favorites-items');
    const emptyMsg = document.getElementById('favorites-empty');
    if (!container) return; // Exit if the container element doesn't exist

    loadFavorites(); // Refresh local list
    container.innerHTML = ''; // Clear existing display

    // If no favorites, show the empty state message
    if (favorites.length === 0) {
        if (emptyMsg) emptyMsg.classList.remove('hidden');
        return;
    }

    // If favorites exist, hide the empty state message
    if (emptyMsg) emptyMsg.classList.add('hidden');

    // Create a card for each favorite item
    favorites.forEach((product, index) => {
        const div = document.createElement('div');
        div.className = "bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-all";
        
        div.innerHTML = `
            <img src="${product.image}" class="w-full h-48 object-cover rounded-[1.5rem] mb-4">
            <div class="px-2 pb-2">
                <div class="font-black text-[#2C3E6B] text-xl mb-1">${product.name}</div>
                <div class="text-[#2C3E6B] font-black text-2xl mb-4">₱${product.price}</div>
                <div class="flex flex-col gap-2">
                    <button onclick="openCustomizationModal(${product.id});" class="w-full bg-[#F4C95F] text-white py-3 rounded-full font-bold text-sm hover:bg-[#e0b755] transition-colors">
                        Customize
                    </button>
                    <button onclick="removeFromFavorites(${index});" class="w-full text-red-400 text-xs font-bold hover:text-red-600 py-2">
                        Remove
                    </button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

// REMOVAL - Removes a specific item from the favorites list and refreshes the view.
function removeFromFavorites(index) {
    favorites.splice(index, 1); // Remove the item at the specific array index
    localStorage.setItem('lumine_favorites', JSON.stringify(favorites)); // Save update
    renderFavoritesPage(); // Refresh the visual display
}

