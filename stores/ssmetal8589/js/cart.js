const CART_KEY = 'ecom_cart';

export const cartStore = {
    get() {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    },

    save(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: cart }));
    },

    addItem(productId, variantId, quantity = 1, productData = {}) {
        let cart = this.get();
        const index = cart.findIndex(item => item.product_id === productId && item.variant_id === variantId);

        if (index > -1) {
            cart[index].quantity += quantity;
        } else {
            cart.push({
                product_id: productId,
                variant_id: variantId,
                quantity: quantity,
                name: productData.name,
                image: productData.image,
                price: productData.price
            });
        }
        this.save(cart);
    },

    updateQuantity(productId, variantId, quantity) {
        let cart = this.get();
        const index = cart.findIndex(item => item.product_id === productId && item.variant_id === variantId);
        if (index > -1) {
            if (quantity <= 0) {
                cart.splice(index, 1);
            } else {
                cart[index].quantity = quantity;
            }
            this.save(cart);
        }
    },

    removeItem(productId, variantId) {
        let cart = this.get();
        cart = cart.filter(item => !(item.product_id === productId && item.variant_id === variantId));
        this.save(cart);
    },

    clear() {
        this.save([]);
    }
};
