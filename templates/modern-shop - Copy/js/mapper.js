export const mapper = {
    formatCurrency(amount, currency = 'INR') {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    },

    calculateDiscount(price, offer) {
        if (!offer || !offer.is_active) return { finalPrice: price, discountAmount: 0, label: null };

        const now = new Date();
        const starts = offer.starts_at ? new Date(offer.starts_at) : null;
        const ends = offer.ends_at ? new Date(offer.ends_at) : null;

        if ((starts && now < starts) || (ends && now > ends)) {
            return { finalPrice: price, discountAmount: 0, label: null };
        }

        let discountAmount = 0;
        if (offer.discount_type === 'percentage') {
            discountAmount = (price * offer.discount_value) / 100;
        } else if (offer.discount_type === 'fixed') {
            discountAmount = offer.discount_value;
        }

        return {
            finalPrice: Math.max(0, price - discountAmount),
            discountAmount: discountAmount,
            label: offer.badge_label || (offer.discount_type === 'percentage' ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`)
        };
    },

    mapProduct(product) {
        const primaryVariant = product.product_variants && product.product_variants.length > 0
            ? product.product_variants[0]
            : { price: product.price, compare_at_price: product.compare_at_price, image_url: product.image_url };

        const offer = product.offers && product.offers.length > 0 ? product.offers[0] : null;
        const { finalPrice, label } = this.calculateDiscount(primaryVariant.price, offer);

        return {
            id: product.id,
            name: product.name,
            description: product.description,
            image: primaryVariant.image_url || product.image_url,
            price: finalPrice,
            originalPrice: primaryVariant.price,
            comparePrice: primaryVariant.compare_at_price || product.compare_at_price,
            discountLabel: label,
            isFeatured: product.is_featured,
            isBestSeller: product.is_best_seller,
            variants: product.product_variants || [],
            reviews: product.product_reviews || []
        };
    }
};
