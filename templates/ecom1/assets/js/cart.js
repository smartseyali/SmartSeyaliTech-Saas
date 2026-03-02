// Shared Cart & User Logic for the Entire Application
const cartKey = 'basik_store_cart';
const wishlistKey = 'basik_store_wishlist';
const authKey = 'basik_store_auth';

// --- Cart Logic ---
function getCart() {
    return JSON.parse(localStorage.getItem(cartKey)) || [];
}

function saveCart(cart) {
    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateCartCounts();
}

function addToCart(productId, quantity = 1, size = '8') {
    // We'll import products dynamically or expect it on window
    const products = window.allProducts || [];
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let cart = getCart();
    const existing = cart.find(item => item.id === productId && item.size === size);

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ ...product, quantity, size });
    }

    saveCart(cart);
    showNotification(`Added ${product.name} to cart!`);

    // Trigger any cart UI updates if present on page
    if (window.renderCartPage) window.renderCartPage();
    if (window.toggleCart) window.toggleCart(true);
}

function removeFromCart(id, size) {
    let cart = getCart();
    cart = cart.filter(item => !(item.id === id && item.size === size));
    saveCart(cart);
    if (window.renderCartPage) window.renderCartPage();
}

function updateCartCounts() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countBadge = document.getElementById('cart-count');
    const totalDisplay = document.getElementById('nav-total');

    if (countBadge) countBadge.textContent = totalCount;
    if (totalDisplay) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalDisplay.textContent = total.toFixed(2);
    }
}

// --- Wishlist Logic ---
function getWishlist() {
    return JSON.parse(localStorage.getItem(wishlistKey)) || [];
}

function toggleWishlist(productId) {
    let wishlist = getWishlist();
    const index = wishlist.indexOf(productId);
    if (index > -1) {
        wishlist.splice(index, 1);
        showNotification("Removed from wishlist");
    } else {
        wishlist.push(productId);
        showNotification("Added to wishlist", "heart");
    }
    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
}

// --- Auth Mock ---
function getCurrentUser() {
    return JSON.parse(localStorage.getItem(authKey)) || null;
}

// --- UI Utilities ---
function showNotification(message, icon = 'check-circle') {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<i class="fa-solid fa-${icon}"></i> <span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('active'), 100);
    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Standard Header/Footer Injection (Simulating backend includes)
async function loadComponent(id, file) {
    try {
        const response = await fetch(file);
        const text = await response.text();
        document.getElementById(id).innerHTML = text;
        updateCartCounts();
    } catch (err) {
        console.error(`Error loading ${file}:`, err);
    }
}

// Initialize on every page
document.addEventListener('DOMContentLoaded', () => {
    updateCartCounts();

    // Check for user
    const user = getCurrentUser();
    const accountLink = document.getElementById('account-link');
    if (user && accountLink) {
        accountLink.textContent = user.name;
    }
});

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.toggleWishlist = toggleWishlist;
window.getCart = getCart;
