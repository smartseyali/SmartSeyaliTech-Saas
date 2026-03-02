const headerHTML = `
<div class="header">
    <div class="container">
        <nav class="nav-main">
            <div class="logo">
                <a href="index.html">BASIK <span>FIT</span></a>
            </div>

            <ul class="nav-links">
                <li><a href="index.html" class="nav-link">Home</a></li>
                <li><a href="shop.html" class="nav-link">Shop</a></li>
                <li><a href="categories.html" class="nav-link">Categories</a></li>
                <li><a href="account.html" class="nav-link">Account</a></li>
                <li><a href="about.html" class="nav-link">About</a></li>
            </ul>

            <div class="nav-actions">
                <button class="nav-btn"><i class="fa-solid fa-magnifying-glass"></i></button>
                <div class="auth-menu">
                    <a href="login.html" class="nav-link" id="account-link">Sign In</a>
                </div>
                <a href="cart.html" class="nav-btn">
                    <i class="fa-solid fa-bag-shopping"></i>
                    <span class="cart-count" id="cart-count">0</span>
                </a>
                <div class="nav-total-wrapper">
                    <span class="currency">$</span><span id="nav-total">0.00</span>
                </div>
            </div>
        </nav>
    </div>
</div>
`;

const footerHTML = `
<footer class="footer">
    <div class="container">
        <div class="footer-grid">
            <div class="footer-col">
                <div class="logo" style="color:#fff; margin-bottom: 1.5rem;">
                    <a href="index.html">BASIK <span>FIT</span></a>
                </div>
                <p style="font-size: 0.9rem; margin-bottom: 2rem; max-width: 300px;">Experience the perfect fusion of architectural design and athletic performance. Reach your peak limits with BASIK FIT.</p>
                <div class="social-links" style="display:flex; gap: 1rem;">
                    <a href="#" style="color:#fff;"><i class="fa-brands fa-facebook-f"></i></a>
                    <a href="#" style="color:#fff;"><i class="fa-brands fa-twitter"></i></a>
                    <a href="#" style="color:#fff;"><i class="fa-brands fa-instagram"></i></a>
                </div>
            </div>

            <div class="footer-col">
                <h3>Shop</h3>
                <ul class="footer-links">
                    <li><a href="shop.html">Running Shoes</a></li>
                    <li><a href="shop.html">Sports Shoes</a></li>
                    <li><a href="shop.html">Casual Shoes</a></li>
                </ul>
            </div>

            <div class="footer-col">
                <h3>Useful Links</h3>
                <ul class="footer-links">
                    <li><a href="#">Return Policies</a></li>
                    <li><a href="#">Announcements</a></li>
                    <li><a href="merchant-dashboard.html">Seller Hub</a></li>
                </ul>
            </div>

            <div class="footer-col">
                <h3>Newsletter</h3>
                <p style="font-size: 0.85rem; margin-bottom: 1rem;">Join for exclusive releases.</p>
                <div style="display:flex; gap: 0.5rem;">
                    <input type="email" placeholder="Email" style="padding:0.5rem; border-radius:4px; border:none; flex:1;">
                    <button class="btn btn-primary" style="padding:0.5rem 1rem;">JOIN</button>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2026 BASIK FIT | Powered by Shoe Store</p>
            <div style="display:flex; gap:1rem; font-size: 1.2rem;">
                <i class="fa-brands fa-cc-visa"></i>
                <i class="fa-brands fa-cc-mastercard"></i>
                <i class="fa-brands fa-cc-paypal"></i>
            </div>
        </div>
    </div>
</footer>
`;

document.addEventListener('DOMContentLoaded', () => {
    const headerRoot = document.getElementById('header-root');
    const footerRoot = document.getElementById('footer-root');

    if (headerRoot) headerRoot.innerHTML = headerHTML;
    if (footerRoot) footerRoot.innerHTML = footerHTML;

    // Trigger cart count updates after injection
    if (window.updateCartCounts) window.updateCartCounts();
});
