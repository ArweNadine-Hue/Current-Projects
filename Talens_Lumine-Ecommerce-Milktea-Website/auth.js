// REGISTRATION - This function handles creating a new user account.
function handleRegister(e) {
    // Prevent the form from refreshing the page on submit
    e.preventDefault();

    // Get input values from the registration form
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    // Create a user object and save it to LocalStorage
    const userData = { name, email, password };
    localStorage.setItem('lumine_registered_user', JSON.stringify(userData));

    // Notify the user and redirect them to the login page
    alert("Registration successful! You can now log in.");
    window.location.href = "login.html";
}

// LOGIN -This function validates user credentials against stored registration data.
function handleLogin(e) {
    // Prevent the form from refreshing the page on submit
    e.preventDefault();

    // Get input values from the login form
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Retrieve the registered user data from LocalStorage
    const storedUser = JSON.parse(localStorage.getItem('lumine_registered_user'));

    // Check if the input matches the stored data
    if (storedUser && storedUser.email === email && storedUser.password === password) {
        // Create an active session ('lumine_user') for the current session
        localStorage.setItem('lumine_user', JSON.stringify(storedUser));
        alert("Login successful!");
        window.location.href = "index.html";
    } else {
        // Show an error if credentials don't match or the user isn't registered
        alert("Invalid credentials or account does not exist. Please register first!");
    }
}

// LOGOUT - This function clears the active user session and returns to login.
function logout() {
    // Remove the current user session key from LocalStorage
    localStorage.removeItem('lumine_user');

    // Redirect the user back to the login page
    window.location.href = "login.html";
}