// GLOBAL UI HELPERS - Displays a temporary toast notification at the bottom of the screen.
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = "toast-animation fixed bottom-8 left-1/2 bg-pink-500 text-white px-6 py-3 rounded-full z-[9999] whitespace-nowrap shadow-lg text-xs font-semibold";
    toast.textContent = message;
    document.body.appendChild(toast);

    // Automatically remove the toast after 2.5 seconds
    setTimeout(() => toast.remove(), 2500);
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    const userData = { name, email, password };
    localStorage.setItem('lumine_registered_user', JSON.stringify(userData));

    alert("Registration successful! You can now log in.");
    window.location.href = "login.html";
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const storedUser = JSON.parse(localStorage.getItem('lumine_registered_user'));

    if (storedUser && storedUser.email === email && storedUser.password === password) {
        localStorage.setItem('lumine_user', JSON.stringify(storedUser));
        alert("Login successful!");
        window.location.href = "index.html";
    } else {
        alert("Invalid credentials or account does not exist. Please register first!");
    }
}

function logout() {
    localStorage.removeItem('lumine_user');
    window.location.href = "login.html";
}

// SHIPPING FORM VALIDATION - Validates the checkout shipping form fields.
// If fields are empty, the "Proceed" button is disabled.
function validateShippingForm() {
    const name = document.getElementById('shipping-name').value.trim();
    const brgy = document.getElementById('address-brgy').value.trim();
    const city = document.getElementById('address-city').value.trim();
    const prov = document.getElementById('address-province').value.trim();
    
    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    let paymentValid = false;

    if (selectedPayment) {
        if (selectedPayment.value === 'cod') {
            paymentValid = true;
        } else if (selectedPayment.value === 'gcash') {
            const gName = document.getElementById('gcash-name').value.trim();
            const gNum = document.getElementById('gcash-number').value.trim();
            paymentValid = gName !== "" && gNum !== "";
        } else if (selectedPayment.value === 'card') {
            const cName = document.getElementById('card-name').value.trim();
            const cDate = document.getElementById('card-date').value.trim();
            const cCvc = document.getElementById('card-cvc').value.trim();
            paymentValid = cName !== "" && cDate !== "" && cCvc !== "";
        }
    }

    const placeOrderBtn = document.getElementById('place-order-btn');
    const isComplete = name !== "" && brgy !== "" && city !== "" && prov !== "" && paymentValid;
    
    if (placeOrderBtn) {
        placeOrderBtn.disabled = !isComplete;
        placeOrderBtn.style.opacity = isComplete ? "1" : "0.5";
        placeOrderBtn.style.cursor = isComplete ? "pointer" : "not-allowed";
    }
}

// DOM INITIALIZATION - Sets up listeners for the payment page once the document is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
    // Attach validation to input fields on the payment page
    if (window.location.pathname.includes('payment.html')) {
        const inputs = ['shipping-name', 'address-brgy', 'address-city', 'address-province'];
        inputs.forEach(id => {
            document.getElementById(id).addEventListener('input', validateShippingForm);
        });
        validateShippingForm();
    }
});

// Sets up real-time address preview logic for the payment page.
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
                    
                    // Join address parts with commas and remove empty fields
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

