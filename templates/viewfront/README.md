
# Vanilla JS Tenant Subscriber Storefront

This is a standalone, performance-optimized storefront built with vanilla HTML, CSS, and Javascript. It replicates the functionality of the React storefront but is designed to be hosted separately and integrated with the SaaS backend via APIs.

## Features
- **Multi-Tenant Ready**: Automatically resolves branding (colors, logo, name) based on the tenant slug.
- **Dynamic Content**: Fetches banners, categories, offers, and products directly from the Supabase backend.
- **Cart Management**: LocalStorage-based cart system with real-time updates.
- **Premium Aesthetics**: Built with a "Modern Organic" theme, custom CSS animations, and Outfit/Inter typography.
- **Zero Build Step**: Pure vanilla implementation—simply open `index.html` in any browser or host on any static server (Vercel, GitHub Pages, Netlify).

## File Structure
- `index.html`: Home page with slider, offers, and bestsellers.
- `shop.html`: Product catalog with category filtering.
- `product.html`: Detailed product view with related items.
- `cart.html`: Shopping bag and order summary.
- `checkout.html`: (Pending implementation) Checkout and payment integration.
- `css/style.css`: Core design system and layout.
- `js/api.js`: Supabase integration and data fetching.
- `js/main.js`: Common app logic (cart, tenant init, branding).
- `js/home.js`, `js/shop.js`, etc.: Page-specific logic.

## Setup & Configuration
1. Open `js/api.js` to modify the Supabase URL and Anon Key if needed.
2. In `js/main.js`, you can change the default `slug` to your tenant's subdomain.
3. Access the site via `index.html?tenant=YOUR_SUBDOMAIN` to view a specific merchant's store.

## API Integration Note
The storefront uses the Supabase Javascript SDK via CDN. All requests are scoped by `company_id` which is retrieved during initialization using the tenant slug. This ensures that the frontend and backend remain perfectly synced across different hosting environments.
