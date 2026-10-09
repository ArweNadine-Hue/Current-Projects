// DOMContentLoaded: Runs once the HTML structure is fully parsed.
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('payment.html')) {
        const inputs = ['shipping-name', 'address-brgy', 'address-city', 'address-province'];
        inputs.forEach(id => {
            document.getElementById(id).addEventListener('input', validateShippingForm);
        });
        validateShippingForm();
    }
});

// Setup Address Preview Logic: Listens for typing in address fields to update the confirmation display.
document.addEventListener('DOMContentLoaded', () => {
    const addressFields = ['address-brgy', 'address-city', 'address-province'];
    const addressDisplay = document.getElementById('address-confirmation');

    if (addressDisplay) {
        addressFields.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => {
                    const brgy = document.getElementById('address-brgy').value;
                    const city = document.getElementById('address-city').value;
                    const prov = document.getElementById('address-province').value;
                    
                    const parts = [brgy, city, prov].filter(part => part.trim() !== "");
                    
                    if (parts.length > 0) {
                        addressDisplay.innerText = parts.join(', ');
                    } else {
                        addressDisplay.innerText = "Please fill out address fields above.";
                    }
                });
            }
        });
    }
});

// WINDOW ONLOAD: Runs last, once everything (images, scripts, CSS) is fully loaded.
window.onload = () => {
    // Auth Guard: Check for user data in localStorage. Redirect to login if user isn't found.
    const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html');
    const user = JSON.parse(localStorage.getItem('lumine_user'));

    if (!user && !isAuthPage) {
        window.location.href = "login.html";
        return;
    }

    // User UI Update: If logged in, set the display name in the navigation/profile area.
    if (user) {
        const displayName = document.getElementById('display-name');
        if (displayName) displayName.innerText = user.name.split(' ')[0];
    }

    // Initialize Data: Fetch and load all necessary app content.
    loadProducts();
    loadCart();
    loadFavorites();
    loadOrderHistory();

    // Page-Specific Renders: Trigger specific UI updates based on the current page.
    if (window.location.pathname.includes('cart.html')) renderCartPage();
    if (window.location.pathname.includes('payment.html')) {
        renderCheckoutSummary();
        
        // Update subtext after a slight delay to allow rendering
        setTimeout(() => {
            const sub = document.getElementById('delivery-address-subtext');
            if (sub) sub.innerHTML = `<i class="fa-solid fa-house-user text-purple-500"></i> Main Kitchen Node Hub, Virac`;
        }, 600);
    }
    if (window.location.pathname.includes('success.html')) triggerSuccessCelebration();
    if (window.location.pathname.includes('orders.html')) renderOrderHistoryPage();
    if (window.location.pathname.includes('tracking.html')) runTrackingMilestones();
    if (window.location.pathname.includes('favorites.html')) renderFavoritesPage();
};

// GLOBAL SCOPE: These listeners are registered immediately when the script loads.
// Handle responsive design: Automatically close the mobile menu if the screen is resized to desktop/tablet size.
window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) toggleMobileMenu(false);
});