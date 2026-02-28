import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twymipaywjufnluuzpug.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3eW1pcGF5d2p1Zm5sdXV6cHVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NTUxOTQsImV4cCI6MjA4NzQzMTE5NH0.--jjugv93Y5PXC66ff25vv0iGlSFtRb4Yt9URsDtr4g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
    console.log('🚀 Starting intensive database seeding...');

    try {
        // 1. Ensure a Company exists
        console.log('🏢 Checking/Creating Company...');
        let { data: company } = await supabase.from('companies').select('*').eq('subdomain', 'sparkle').maybeSingle();

        if (!company) {
            const { data: newCompany, error: cErr } = await supabase.from('companies').insert([{
                name: 'SparkleAHS Luxury',
                subdomain: 'sparkle',
                is_active: true
            }]).select().single();
            if (cErr) throw cErr;
            company = newCompany;
        }
        const companyId = company.id;
        console.log(`✅ Company Ready: ${company.name} (${companyId})`);

        // 2. Seed Banners
        console.log('🖼️ Seeding Banners...');
        const banners = [
            {
                company_id: companyId,
                title: 'EVOLVE YOUR STYLE',
                subtitle: 'Discover the 2024 Spring Collection. Handcrafted luxury for the modern individual.',
                image_url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?q=80&w=2070',
                position: 'hero',
                badge_text: 'Limited Edition',
                is_active: true,
                display_order: 1
            },
            {
                company_id: companyId,
                title: 'PREMIUM TECH ESSENTIALS',
                subtitle: 'Supercharge your productivity with our latest workspace gadgets.',
                image_url: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=2000',
                position: 'mid_page',
                badge_text: 'Top Rated',
                is_active: true,
                display_order: 2
            }
        ];
        await supabase.from('ecom_banners').delete().eq('company_id', companyId);
        await supabase.from('ecom_banners').insert(banners);

        // 3. Seed Products
        console.log('📦 Seeding Products...');
        const products = [
            {
                company_id: companyId,
                name: 'iPhone 15 Pro Max',
                category: 'Electronics',
                sku: 'IPH-15-PM-NAT',
                rate: 159900,
                description: 'Titanium design. A17 Pro chip. A customizable Action button. The most powerful iPhone camera system ever.',
                image_url: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=1974',
                is_ecommerce: true,
                is_featured: true,
                is_best_seller: true,
                status: 'active'
            },
            {
                company_id: companyId,
                name: 'MacBook Pro M3 Max',
                category: 'Electronics',
                sku: 'MBP-M3-MAX',
                rate: 349900,
                description: 'The most advanced chips ever built for a personal computer. M3, M3 Pro, and M3 Max deliver extreme performance and incredible battery life.',
                image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2052',
                is_ecommerce: true,
                is_featured: true,
                status: 'active'
            },
            {
                company_id: companyId,
                name: 'Aero-Leather Pilot Jacket',
                category: 'Fashion',
                sku: 'AERO-LJ-01',
                rate: 24500,
                description: 'Grade-A lambskin leather with a distressed vintage finish. Windproof, waterproof, and timeless.',
                image_url: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?q=80&w=2046',
                is_ecommerce: true,
                is_featured: true,
                status: 'active'
            },
            {
                company_id: companyId,
                name: 'Zenith Mechanical Watch',
                category: 'Luxury',
                sku: 'ZEN-MW-CHRONO',
                rate: 85900,
                description: 'Swiss-made automatic movement with a 72-hour power reserve and sapphire crystal dome.',
                image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1934',
                is_ecommerce: true,
                is_featured: true,
                is_best_seller: true,
                status: 'active'
            },
            {
                company_id: companyId,
                name: 'Organic Silk Bedding Set',
                category: 'Home',
                sku: 'HOME-SILK-01',
                rate: 18500,
                description: '100% Mulberry silk with a 22-momme weight for the ultimate sleep experience.',
                image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071',
                is_ecommerce: true,
                is_featured: false,
                status: 'active'
            },
            {
                company_id: companyId,
                name: 'Sony A7R V Mirrorless',
                category: 'Electronics',
                sku: 'SONY-A7RV',
                rate: 325000,
                description: '61.0 MP full-frame sensor with AI-based autofocus and 8K video recording capabilities.',
                image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1938',
                is_ecommerce: true,
                is_featured: true,
                status: 'active'
            }
        ];

        // Clear existing products for this company to avoid SKU conflicts in simple seeder
        await supabase.from('products').delete().eq('company_id', companyId);
        const { data: insertedProducts, error: pErr } = await supabase.from('products').insert(products).select();
        if (pErr) throw pErr;

        // 4. Seed Variants
        console.log('🧬 Seeding Variants...');
        const iphone = insertedProducts.find(p => p.sku === 'IPH-15-PM-NAT');
        if (iphone) {
            await supabase.from('product_variants').insert([
                { company_id: companyId, product_id: iphone.id, name: 'Natural Titanium / 256GB', price: 159900, sku: 'IPH-15-256', attributes_summary: '256GB', stock_qty: 100 },
                { company_id: companyId, product_id: iphone.id, name: 'Blue Titanium / 512GB', price: 179900, sku: 'IPH-15-512', attributes_summary: '512GB', stock_qty: 45 },
                { company_id: companyId, product_id: iphone.id, name: 'White Titanium / 1TB', price: 199900, sku: 'IPH-15-1TB', attributes_summary: '1TB', stock_qty: 12 }
            ]);
        }

        // 5. Seed Historical Orders
        console.log('📊 Seeding Historical Orders...');
        await supabase.from('ecom_orders').delete().like('order_number', 'ORD-%-TEST');

        const sampleOrders = [
            {
                company_id: companyId,
                order_number: 'ORD-1001-TEST',
                customer_name: 'Aditya Kumar',
                customer_email: 'aditya@example.com',
                customer_phone: '9876543210',
                shipping_address: { line1: 'Sector 42, HSR Layout', city: 'Bangalore', pincode: '560102', state: 'Karnataka' },
                subtotal: 159900,
                grand_total: 159900,
                status: 'delivered',
                payment_status: 'paid',
                payment_method: 'card',
                created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                company_id: companyId,
                order_number: 'ORD-1002-TEST',
                customer_name: 'Priya Sharma',
                customer_email: 'priya@example.com',
                customer_phone: '8877665544',
                shipping_address: { line1: 'Park Street', city: 'Kolkata', pincode: '700016', state: 'West Bengal' },
                subtotal: 85900,
                grand_total: 85900,
                status: 'shipped',
                payment_status: 'paid',
                payment_method: 'upi',
                created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        const { data: insertedOrders, error: oErr } = await supabase.from('ecom_orders').insert(sampleOrders).select();
        if (oErr) throw oErr;

        console.log('✨ DATABASE SEEDING COMPLETE!');

    } catch (err) {
        console.error('❌ Seeding Failed:', err);
    }
}

seed();
