/**
 * Cart Module - localStorage based with Supabase order sync
 */

const Cart = {
  getItems() {
    const items = localStorage.getItem(STORE_CONFIG.cartStorageKey);
    return items ? JSON.parse(items) : [];
  },

  save(items) {
    localStorage.setItem(STORE_CONFIG.cartStorageKey, JSON.stringify(items));
    this.updateCartBadge();
    document.dispatchEvent(new CustomEvent('cart-updated', { detail: items }));
  },

  addItem(product, quantity = 1, variant = null) {
    const items = this.getItems();
    const pid = String(product.id);
    const key = variant ? `${pid}_${variant.id}` : pid;
    const existing = items.find(i => i.key === key);

    if (existing) {
      existing.quantity += quantity;
    } else {
      const basePrice = product.selling_price || 0;
      const baseMrp = product.mrp || basePrice;
      // Use variant's own prices if available, else base + adjustment
      const itemPrice = variant
        ? (variant.selling_price || (basePrice + (variant.price_adjustment || 0)))
        : basePrice;
      const itemMrp = variant
        ? (variant.mrp || (variant.selling_price ? variant.selling_price : (baseMrp + (variant.price_adjustment || 0))))
        : baseMrp;
      items.push({
        key,
        product_id: pid,
        name: product.item_name || product.name,
        image_url: product.image_url,
        price: itemPrice,
        mrp: itemMrp,
        quantity,
        variant_id: variant?.id || null,
        variant_name: variant?.name || null,
      });
    }

    this.save(items);
    showToast(`${product.item_name || product.name} added to cart!`, 'success');
    if (typeof window.trackEvent === 'function') {
      const currency = (window.STORE_CONFIG && window.STORE_CONFIG.currency === '₹') ? 'INR' : (window.STORE_CONFIG && window.STORE_CONFIG.currency) || 'INR';
      window.trackEvent('add_to_cart', {
        currency,
        value: (variant ? (variant.selling_price || basePrice) : basePrice) * quantity,
        items: [{ item_id: pid, item_name: product.item_name || product.name, price: variant ? (variant.selling_price || basePrice) : basePrice, quantity }]
      });
    }
    return items;
  },

  removeItem(key) {
    const before = this.getItems();
    const removed = before.find(i => i.key === key);
    let items = before.filter(i => i.key !== key);
    this.save(items);
    if (removed && typeof window.trackEvent === 'function') {
      const currency = (window.STORE_CONFIG && window.STORE_CONFIG.currency === '₹') ? 'INR' : (window.STORE_CONFIG && window.STORE_CONFIG.currency) || 'INR';
      window.trackEvent('remove_from_cart', {
        currency,
        value: removed.price * removed.quantity,
        items: [{ item_id: removed.product_id, item_name: removed.name, price: removed.price, quantity: removed.quantity }]
      });
    }
    return items;
  },

  updateQuantity(key, quantity) {
    const items = this.getItems();
    const item = items.find(i => i.key === key);
    if (item) {
      item.quantity = Math.max(1, quantity);
    }
    this.save(items);
    return items;
  },

  clear() {
    localStorage.removeItem(STORE_CONFIG.cartStorageKey);
    this.updateCartBadge();
    document.dispatchEvent(new CustomEvent('cart-updated', { detail: [] }));
  },

  getSubtotal() {
    return this.getItems().reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getItemCount() {
    return this.getItems().reduce((sum, item) => sum + item.quantity, 0);
  },

  updateCartBadge() {
    const count = this.getItemCount();
    document.querySelectorAll('.cart-count-badge').forEach(el => {
      el.textContent = count;
    });
  },

  // Sidebar cart (Blueberry template classes)
  openSidebar() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (sidebar) {
      sidebar.classList.add('bb-open-cart');
      overlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
      this.renderSidebar();
    }
  },

  closeSidebar() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (sidebar) {
      sidebar.classList.remove('bb-open-cart');
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }
  },

  renderSidebar() {
    const container = document.getElementById('sidebar-cart-items');
    const totalEl = document.getElementById('sidebar-cart-total');
    if (!container) return;

    const items = this.getItems();

    if (items.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="ri-shopping-bag-line" style="font-size: 48px; color: #ccc;"></i>
          <p class="mt-3 text-muted">Your cart is empty</p>
          <a href="shop.html" class="bb-btn-2 mt-2">Continue Shopping</a>
        </div>`;
      if (totalEl) totalEl.textContent = STORE_CONFIG.currency + '0';
      return;
    }

    container.innerHTML = '<ul class="bb-cart-items">' + items.map(item => `
      <li class="cart-sidebar-list">
        <a class="cart-remove-item" onclick="Cart.removeItem('${item.key}'); Cart.renderSidebar();">
          <i class="ri-close-line"></i>
        </a>
        <a href="product?id=${item.product_id}" class="bb-cart-pro-img">
          <img src="${item.image_url || 'assets/img/product/default.jpg'}" alt="${item.name}">
        </a>
        <div class="bb-cart-contact">
          <a href="product?id=${item.product_id}" class="bb-cart-sub-title">${item.name}</a>
          <span class="cart-price">
            <span class="new-price">${STORE_CONFIG.currency}${(item.price * item.quantity).toFixed(2)}</span>
            ${item.variant_name ? ' <small class="text-muted">(' + item.variant_name + ')</small>' : ''}
          </span>
          <div class="qty-selector qty-selector-sm">
            <button class="qty-btn qty-minus" onclick="Cart.updateQuantity('${item.key}', ${item.quantity - 1}); Cart.renderSidebar();"><i class="ri-subtract-line"></i></button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn qty-plus" onclick="Cart.updateQuantity('${item.key}', ${item.quantity + 1}); Cart.renderSidebar();"><i class="ri-add-line"></i></button>
          </div>
        </div>
      </li>
    `).join('') + '</ul>';

    if (totalEl) totalEl.textContent = STORE_CONFIG.currency + this.getSubtotal().toFixed(2);
  },
};
