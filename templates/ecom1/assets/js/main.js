import products from './products.js';

// State Management
let cart = JSON.parse(localStorage.getItem('basik_cart')) || [];
let currentView = 'home';

// DOM Elements
const productGrid = document.getElementById('product-grid');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const navTotal = document.getElementById('nav-total');
const cartItemsContainer = document.getElementById('cart-items');
const cartPanel = document.getElementById('cart-panel');
const cartOverlay = document.getElementById('cart-overlay');
const viewSections = document.querySelectorAll('.view-section');
const filterBtns = document.querySelectorAll('.filter-btn');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
    updateCartUI();
    initGSAP();
    setupFilters();
    initQuantityControls();

    // Expose functions to global scope
    window.showSection = showSection;
    window.toggleCart = toggleCart;
    window.addToCart = addToCart;
    window.removeFromCart = removeFromCart;
    window.showProductDetail = showProductDetail;
});

// Render Products
function renderProducts(productsToRender) {
    if (!productGrid) return;
    productGrid.innerHTML = '';
    productsToRender.forEach((product) => {
        const productHTML = `
            <div class="product-card" data-category="${product.category}" style="opacity:0; transform: translateY(30px)">
                <div class="product-img" onclick="showProductDetail(${product.id})">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="product-overlay">
                        <button class="btn-add" onclick="event.stopPropagation(); addToCart(${product.id})">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="product-info" onclick="showProductDetail(${product.id})">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-pricing">
                        <span class="old-price">$${product.oldPrice.toFixed(2)}</span>
                        <span class="product-price">$${product.price.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
        productGrid.insertAdjacentHTML('beforeend', productHTML);
    });

    gsap.to('.product-card', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
    });
}

function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const detailImg = document.getElementById('detail-img');
    const detailName = document.getElementById('detail-name');
    const detailCategory = document.getElementById('detail-category');
    const detailPrice = document.getElementById('detail-price');
    const detailOldPrice = document.getElementById('detail-old-price');
    const detailDesc = document.getElementById('detail-desc');
    const qtyInput = document.getElementById('qty-input');
    const addBtn = document.getElementById('detail-add-btn');

    if (detailImg) detailImg.src = product.image;
    if (detailName) detailName.textContent = product.name;
    if (detailCategory) detailCategory.textContent = product.category;
    if (detailPrice) detailPrice.textContent = `$${product.price.toFixed(2)}`;
    if (detailOldPrice) detailOldPrice.textContent = `$${product.oldPrice.toFixed(2)}`;
    if (detailDesc) detailDesc.textContent = product.description;

    if (qtyInput) qtyInput.value = 1;

    if (addBtn) {
        addBtn.onclick = () => {
            const qty = parseInt(qtyInput.value) || 1;
            addToCart(product.id, qty);
        };
    }

    renderRelatedProducts(product.category, product.id);
    showSection('product-detail');
}

function renderRelatedProducts(category, excludeId) {
    const relatedGrid = document.getElementById('related-grid');
    if (!relatedGrid) return;

    const related = products
        .filter(p => p.category === category && p.id !== excludeId)
        .slice(0, 4);

    relatedGrid.innerHTML = '';
    related.forEach(product => {
        const productHTML = `
            <div class="product-card" onclick="showProductDetail(${product.id})">
                <div class="product-img">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-pricing">
                        <span class="product-price">$${product.price.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
        relatedGrid.insertAdjacentHTML('beforeend', productHTML);
    });
}

// Filters
function setupFilters() {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.getAttribute('data-filter');

            const filteredProducts = filterValue === 'all'
                ? products
                : products.filter(p => p.category === filterValue);

            renderProducts(filteredProducts);
            showSection('home');
        });
    });
}

// Quantity Controls
function initQuantityControls() {
    const minus = document.getElementById('qty-minus');
    const plus = document.getElementById('qty-plus');
    const input = document.getElementById('qty-input');

    if (minus && plus && input) {
        minus.addEventListener('click', () => {
            if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
        });
        plus.addEventListener('click', () => {
            input.value = parseInt(input.value) + 1;
        });
    }
}

// Cart Logic
function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ ...product, quantity: quantity });
    }

    updateCartUI();
    toggleCart(true);

    gsap.to('.cart-icon', {
        scale: 1.2,
        duration: 0.2,
        yoyo: true,
        repeat: 1
    });
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

function updateCartUI() {
    localStorage.setItem('basik_cart', JSON.stringify(cart));

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalItems;

    const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    if (cartTotal) cartTotal.textContent = `$${totalAmount.toFixed(2)}`;
    if (navTotal) navTotal.textContent = totalAmount.toFixed(2);

    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
        } else {
            cart.forEach(item => {
                const itemHTML = `
                    <div class="cart-item">
                        <div class="cart-item-img">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="cart-item-info">
                            <div class="cart-item-title">${item.name}</div>
                            <div class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity}</div>
                            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">REMOVE</button>
                        </div>
                    </div>
                `;
                cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
            });
        }
    }

    updateCheckoutSummary(totalAmount);
}

function toggleCart(forceOpen = false) {
    if (!cartPanel || !cartOverlay) return;
    if (forceOpen === true) {
        cartPanel.classList.add('active');
        cartOverlay.classList.add('active');
    } else {
        cartPanel.classList.toggle('active');
        cartOverlay.classList.toggle('active');
    }
}

// Navigation & Views
function showSection(sectionId) {
    viewSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    const targetSection = document.querySelector(`#${sectionId} > .container`);
    if (targetSection) {
        gsap.from(targetSection, {
            opacity: 0,
            y: 20,
            duration: 0.8,
            ease: "power3.out"
        });
    }
}

// Checkout Summary
function updateCheckoutSummary(total) {
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    const checkoutTotal = document.getElementById('checkout-total');

    if (!checkoutItems) return;

    checkoutItems.innerHTML = '';
    cart.forEach(item => {
        const row = `
            <tr>
                <td>${item.name} × ${item.quantity}</td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `;
        checkoutItems.insertAdjacentHTML('beforeend', row);
    });

    if (checkoutSubtotal) checkoutSubtotal.textContent = `$${total.toFixed(2)}`;
    if (checkoutTotal) checkoutTotal.textContent = `$${total.toFixed(2)}`;
}

// GSAP Animations
function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline();
    tl.from('.badge', { opacity: 0, y: -20, duration: 0.8 })
        .from('.hero-text h1', { opacity: 0, y: 30, duration: 1 }, "-=0.4")
        .from('.hero-text p', { opacity: 0, y: 20, duration: 0.8 }, "-=0.6")
        .from('.hero-btns', { opacity: 0, x: -50, duration: 0.8 }, "-=0.6");

    gsap.from('.section-header h2', {
        scrollTrigger: {
            trigger: '.section-header',
            start: 'top 80%',
        },
        opacity: 0,
        x: -50,
        duration: 1,
        ease: "power2.out"
    });
}
