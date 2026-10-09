// GLOBAL STATE CONTAINERS - These variables keep track of your app's data in the browser's memory while the user is navigating.
// Lists to store fetched app data
let products = []; // Holds all menu items
let cart = []; // Current items selected for purchase
let favorites = []; // Items marked as favorites
let orderHistory = []; // Completed orders

// User experience and navigation settings
let selectedCategoryFilter = 'all'; // Current category being viewed
let activeDiscountPercent = 0; // Holds any applied promo code value
let currentPage = 1; // Tracking page index for pagination
const itemsPerPage = 12; // Number of products shown per page

// DESIGN CONSTANTS (Theming) - A central place to manage your brand colors so you can update them across the entire app by changing one value here.
const COLORS = {
    primary: "#F4C95F",
    accent: "#FF9EBE",
    dark: "#2C3E6B",
    bgCard: "#F5EDE4"
};

// PROMOTIONAL LOGIC - A dictionary of valid coupon codes and their corresponding discount percentages.
const PROMO_CODES = {
    "LUMINE20": 20,
    "FIRSTLUMINE": 15,
    "SUMMER2026": 10
};
