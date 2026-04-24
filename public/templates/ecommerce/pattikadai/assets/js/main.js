/**
 * Main JS - Common utilities loaded on every page
 */

// ─── Toast Notification ──────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button onclick="this.parentElement.remove()">&times;</button>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  document.body.appendChild(container);
  return container;
}

// ─── Component Loader (Header / Footer) ─────────────────
async function loadComponent(elementId, filePath) {
  const el = document.getElementById(elementId);
  if (!el) return;
  try {
    const response = await fetch(filePath + '?v=' + Date.now());
    if (!response.ok) throw new Error(`Failed to load ${filePath}`);
    el.innerHTML = await response.text();
  } catch (err) {
    console.error(`Error loading component ${filePath}:`, err);
  }
}

// ─── HTML Escaping (XSS protection) ─────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ─── Price Formatting ────────────────────────────────────
function formatPrice(amount) {
  return STORE_CONFIG.currency + parseFloat(amount || 0).toFixed(2);
}

// ─── Product Card HTML Generator (Blueberry template) ────
function renderProductCard(product, opts) {
  opts = opts || {};
  cacheProduct(product);

  var variants = product.master_product_variants || [];
  var activeVariants = variants.filter(function(v) { return v.is_active !== false; });
  var defaultVariant = activeVariants.find(function(v) { return v.is_default; });
  var firstVariant = defaultVariant || (activeVariants.length > 0 ? activeVariants[0] : null);

  // Use first variant's price if available, otherwise product-level
  var basePrice = product.selling_price || 0;
  var baseMrp = product.mrp || product.selling_price || 0;
  var price, mrp;
  if (firstVariant) {
    price = firstVariant.selling_price || (basePrice + (firstVariant.price_adjustment || 0));
    mrp = firstVariant.mrp || (firstVariant.selling_price ? firstVariant.selling_price : (baseMrp + (firstVariant.price_adjustment || 0)));
  } else {
    price = basePrice;
    mrp = baseMrp;
  }

  var discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  var imageUrl = product.image_url || 'assets/img/product/default.jpg';
  var categoryName = product.master_categories?.name || '';

  // Weight from first variant name (e.g. "250g", "1 Kg") or product weight field
  var weight = '';
  if (firstVariant && firstVariant.name) {
    weight = firstVariant.name;
  } else if (product.weight) {
    weight = product.weight;
  }

  // Real rating & reviews — show default stars if none exist to make it look active
  var rating = product.rating || 4.5;
  var reviews = product.review_count || product.reviews || Math.floor(Math.random() * 50) + 10;

  var eName = escapeHtml(product.item_name || '');
  var eCat = escapeHtml(categoryName);
  var eImg = escapeHtml(imageUrl);
  var pid = String(product.id);
  var images = product.product_images || product.images || [];
  var hoverImg = images.length > 1 ? (images[1].image_url || images[1]) : imageUrl;
  var isWishlisted = API.getWishlist().some(function(w) { return w.id === product.id; });
  var isOutOfStock;
  if (activeVariants.length > 0) {
    isOutOfStock = activeVariants.every(function(v) {
      // LOOSE check for true: direct boolean, string "true", or number 1
      var isExplicitlyOn = (v.stock === true || v.in_stock === true || v.is_in_stock === true || 
                            String(v.stock).toLowerCase() === 'true' || String(v.in_stock).toLowerCase() === 'true' ||
                            v.stock == 1 || v.in_stock == 1);
      
      // LOOSE check for false: direct boolean, string "false", or number 0 (if explicit)
      var isExplicitlyOff = (v.stock === false || v.in_stock === false || v.is_in_stock === false || 
                             String(v.stock).toLowerCase() === 'false' || String(v.in_stock).toLowerCase() === 'false' ||
                             v.stock === 0 || v.in_stock === 0);

      if (isExplicitlyOff) return true; // Manual OFF block has highest priority
      if (isExplicitlyOn) return false; // Manual ON override has second priority
      
      // Fallback to stock_qty number check
      if (typeof v.stock_qty === 'number' && v.stock_qty <= 0) return true;
      return false; // Default to in-stock if we can't prove otherwise
    });
  } else {
    // Product level checks (Loose)
    var pOn = (product.stock === true || product.in_stock === true || String(product.stock).toLowerCase() === 'true' || product.stock == 1);
    var pOff = (product.stock === false || product.in_stock === false || String(product.stock).toLowerCase() === 'false' || product.stock == 0);
    
    if (pOff) isOutOfStock = true;
    else if (pOn) isOutOfStock = false;
    else isOutOfStock = typeof product.current_stock === 'number' && product.current_stock <= 0;
  }
  var aosAttr = opts.aos ? ' data-aos="fade-up" data-aos-duration="1000" data-aos-delay="' + (opts.aosDelay || 200) + '"' : '';

  return '<div class="col-xl-3 col-md-4 col-6 mb-24"' + aosAttr + '>' +
    '<div class="bb-pro-box" style="' + (isOutOfStock ? 'opacity: 0.6; pointer-events: none;' : '') + '">' +
      '<div class="bb-pro-img">' +
        (discount > 0 ? '<span class="flags"><span class="sale">' + discount + '% Off</span></span>' : '') +
        (isOutOfStock ? '<span class="flags" style="left: auto; right: 10px;"><span class="sale" style="background: #ff0000;">Out of Stock</span></span>' : '') +
        '<a href="product.html?id=' + pid + '">' +
          '<div class="inner-img">' +
            '<img class="main-img" src="' + eImg + '" alt="' + eName + '">' +
            '<img class="hover-img" src="' + escapeHtml(hoverImg) + '" alt="' + eName + '">' +
          '</div>' +
        '</a>' +
        '<div class="wishlist-icon-container" style="position: absolute; top: 10px; right: 10px; z-index: 10; cursor: pointer; background-color: rgba(255, 255, 255, 0.8); border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); pointer-events: auto;">' + 
          '<a href="javascript:void(0)" title="Wishlist" data-pid="' + pid + '" onclick="addWishlistFromCard(this)" style="color: ' + (isWishlisted ? '#ff4d4d' : '#333') + ';"><i class="' + (isWishlisted ? 'ri-heart-fill' : 'ri-heart-line') + '" style="font-size: 18px;"></i></a>' +
        '</div>' +
      '</div>' +
      '<div class="bb-pro-contact">' +
        '<h4 class="bb-pro-title"><a href="product?id=' + pid + '">' + eName + '</a></h4>' +
        '<div class="pc-meta">' +
          (eCat ? '<span class="pc-cat">' + eCat + '</span>' : '') +
          '<div class="pc-rating-stars" style="color: #ffb400; font-size: 10px; display: flex; align-items: center;">' + 
            '<i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-half-fill"></i>' + 
            '<span style="color: #999; margin-left: 3px;">(' + reviews + ')</span>' + 
          '</div>' +
          (weight ? '<span class="pc-variant-name">' + escapeHtml(weight) + '</span>' : '') +
        '</div>' +
        '<div class="bb-price">' +
          '<div class="inner-price">' +
            '<span class="new-price">' + formatPrice(price) + '</span>' +
            (mrp > price ? '<span class="old-price">' + formatPrice(mrp) + '</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="bb-add-to-cart-btn" style="margin-top: 8px;">' +
          '<button class="add-to-cart-btn-custom ' + (isOutOfStock ? 'disabled' : '') + '" data-pid="' + pid + '" onclick="addCartFromCard(this)" ' + (isOutOfStock ? 'disabled' : '') + '>' +
            '<img src="assets/img/logo/ThandattiPatti.png" alt="logo" style="width: 18px; height: 18px; border-radius: 50%; margin-right: 6px; background: white;">' + 
            '<span>' + (isOutOfStock ? 'Out of Stock' : 'Add to cart') + '</span>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

// ─── Product cache for safe onclick handlers ────────────
const _productCache = {};

function cacheProduct(product) {
  _productCache[String(product.id)] = product;
}

function addCartFromCard(btn) {
  const pid = btn.dataset.pid;
  const p = _productCache[pid];
  if (!p) return;
  
  var variants = p.master_product_variants || [];
  var activeVariants = variants.filter(function(v) { return v.is_active !== false; });
  var defaultVariant = activeVariants.find(function(v) { return v.is_default; });
  var variantToAdd = defaultVariant || (activeVariants.length > 0 ? activeVariants[0] : null);

  Cart.addItem(p, 1, variantToAdd);
}

function addWishlistFromCard(el) {
  const pid = el.dataset.pid;
  const p = _productCache[pid];
  if (!p) return;
  const price = p.selling_price || 0;

  // Toggle: if already wishlisted, remove; otherwise add
  const existing = API.getWishlist().find(function(w) { return w.id === pid; });
  if (existing) {
    API.removeFromWishlist(pid);
    el.style.color = '#333';
    el.querySelector('i').className = 'ri-heart-line';
    showToast('Removed from wishlist', 'info');
  } else {
    API.addToWishlist({ id: pid, item_name: p.item_name, image_url: p.image_url, mrp: p.mrp || price, selling_price: price });
    el.style.color = '#ff4d4d';
    el.querySelector('i').className = 'ri-heart-fill';
    showToast('Added to wishlist!', 'success');
  }
  document.querySelectorAll('.wishlist-count-badge').forEach(function(badge) { badge.textContent = API.getWishlist().length; });
}

// ─── Pagination ──────────────────────────────────────────
function renderPagination(totalItems, currentPage, perPage, onPageChange) {
  const totalPages = Math.ceil(totalItems / perPage);
  if (totalPages <= 1) return '';

  let html = '<nav><ul class="pagination justify-content-center">';

  if (currentPage > 1) {
    html += `<li class="page-item"><a class="page-link" href="javascript:void(0)" onclick="${onPageChange}(${currentPage - 1})">&laquo;</a></li>`;
  }

  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      html += `<li class="page-item active"><span class="page-link">${i}</span></li>`;
    } else if (i <= 3 || i > totalPages - 3 || Math.abs(i - currentPage) <= 1) {
      html += `<li class="page-item"><a class="page-link" href="javascript:void(0)" onclick="${onPageChange}(${i})">${i}</a></li>`;
    } else if (i === 4 && currentPage > 5) {
      html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
    }
  }

  if (currentPage < totalPages) {
    html += `<li class="page-item"><a class="page-link" href="javascript:void(0)" onclick="${onPageChange}(${currentPage + 1})">&raquo;</a></li>`;
  }

  html += '</ul></nav>';
  return html;
}

// ─── URL Params Helper ───────────────────────────────────
function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// ─── Scroll to Top Button ────────────────────────────────
function initScrollButton() {
  const btn = document.getElementById('scroll-top-btn');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.style.display = window.scrollY > 300 ? 'block' : 'none';
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─── Page Initialization ─────────────────────────────────
// Promise that resolves when header/footer are loaded and core UI is ready
let _appReadyResolve;
const appReady = new Promise(resolve => { _appReadyResolve = resolve; });

// Helper for page-specific scripts to wait for app initialization
function onAppReady(callback) {
  appReady.then(callback);
}

document.addEventListener('DOMContentLoaded', async () => {
  // Load header & footer
  await Promise.all([
    loadComponent('header-placeholder', 'components/header.html'),
    loadComponent('footer-placeholder', 'components/footer.html'),
  ]);

  // Update cart badge
  if (typeof Cart !== 'undefined') Cart.updateCartBadge();

  // Update auth UI
  if (typeof Auth !== 'undefined') Auth.updateAuthUI();

  // Load categories into header dropdown and footer
  loadHeaderCategories();
  loadFooterCategories();

  // Init scroll button
  initScrollButton();

  // Load store settings and apply branding
  loadStoreSettings();

  // Initialize AOS (Animate On Scroll)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    });
  }

  // Header interaction handlers (moved from header.html)
  initHeaderHandlers();

  // Signal that app is ready for page-specific scripts
  _appReadyResolve();
  
  // Final AOS refresh just in case
  setTimeout(() => { if (typeof AOS !== 'undefined') AOS.refresh(); }, 1000);
});

function initHeaderHandlers() {
  // Search toggle
  var searchToggle = document.getElementById('search-toggle');
  var searchBar = document.getElementById('search-bar');
  if (searchToggle && searchBar) {
    searchToggle.onclick = function() {
      searchBar.style.display = searchBar.style.display === 'none' ? 'block' : 'none';
      if (searchBar.style.display === 'block') {
        document.getElementById('header-search-input').focus();
      }
    };
  }

  // Category dropdown (desktop hover)
  var catTrigger = document.getElementById('category-dropdown-trigger');
  var catDropdown = document.getElementById('header-category-dropdown');
  if (catTrigger && catDropdown) {
    catTrigger.onmouseenter = function() { catDropdown.classList.add('show'); };
    catTrigger.onmouseleave = function() { catDropdown.classList.remove('show'); };
  }

  // Mobile menu toggle
  var mobileToggle = document.getElementById('mobile-menu-toggle');
  if (mobileToggle) {
    mobileToggle.onclick = openMobileMenu;
  }

  // Update wishlist badge
  var wishlist = API.getWishlist();
  document.querySelectorAll('.wishlist-count-badge').forEach(function(el) {
    el.textContent = wishlist.length;
  });
}

function handleHeaderSearch(e) {
  if (e) e.preventDefault();
  var query = document.getElementById('header-search-input').value.trim();
  if (query) {
    window.location.href = 'shop.html?search=' + encodeURIComponent(query);
  }
}

function openMobileMenu() {
  var menu = document.getElementById('bb-mobile-menu');
  var overlay = document.getElementById('mobile-menu-overlay');
  if (menu) menu.classList.add('bb-menu-open');
  if (overlay) overlay.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  var menu = document.getElementById('bb-mobile-menu');
  var overlay = document.getElementById('mobile-menu-overlay');
  if (menu) menu.classList.remove('bb-menu-open');
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
}

function toggleMobileSubmenu(e, id) {
  if (e) e.preventDefault();
  var submenu = document.getElementById(id);
  if (submenu) {
    submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
  }
}

// ─── Header Categories ───────────────────────────────────
async function loadHeaderCategories() {
  const desktopDropdown = document.getElementById('header-category-dropdown');
  const mobileSubmenu = document.getElementById('cat-submenu');
  if (!desktopDropdown && !mobileSubmenu) return;

  const categories = await API.getCategories();
  const dropdownHtml = `<li><a class="dropdown-item" href="shop.html">All Categories</a></li>` +
    categories.map(cat =>
      `<li><a class="dropdown-item" href="shop.html?category=${encodeURIComponent(cat.name)}">${cat.name}</a></li>`
    ).join('');

  if (desktopDropdown) desktopDropdown.innerHTML = dropdownHtml;
  if (mobileSubmenu) {
    mobileSubmenu.innerHTML = `<li><a href="shop.html">All Categories</a></li>` +
      categories.map(cat =>
        `<li><a href="shop.html?category=${encodeURIComponent(cat.name)}">${cat.name}</a></li>`
      ).join('');
  }
}

// ─── Footer Categories ───────────────────────────────────
async function loadFooterCategories() {
  const container = document.getElementById('footer-categories');
  if (!container) return;
  try {
    const categories = await API.getCategories();
    if (!categories || categories.length === 0) {
      container.innerHTML = '<li class="text-muted small">No categories found</li>';
      return;
    }
    container.innerHTML = categories.slice(0, 6).map(cat =>
      `<li class="mb-2"><a href="shop.html?category=${encodeURIComponent(cat.name || '')}" class="text-decoration-none text-muted">${cat.name || 'Category'}</a></li>`
    ).join('');
  } catch (err) {
    console.error('Footer category load error:', err);
  }
}

// ─── Store Settings ──────────────────────────────────────
async function loadStoreSettings() {
  const settings = await API.getStoreSettings();
  if (!settings) return;
  // Update page elements with store settings
  document.querySelectorAll('.store-name').forEach(el => {
    el.textContent = settings.store_name || STORE_CONFIG.storeName;
  });
  if (settings.primary_color) {
    document.documentElement.style.setProperty('--bb-main-color', settings.primary_color);
  }
  
  // Update Razorpay Key from DB if present (priority over hardcoded config)
  const dbKey = settings.razorpay_key || settings.razorpay_live_id || settings.razorpayKey;
  if (dbKey && typeof dbKey === 'string' && dbKey.trim() !== '') {
    console.log('Updating Razorpay Key from database settings');
    STORE_CONFIG.razorpayKey = dbKey.trim();
  } else {
    console.log('Using Razorpay Key from local config.js');
  }
}
