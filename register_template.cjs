
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vxwjfonhadjjbdmkdrjc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4d2pmb25oYWRqamJkbWtkcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NTg0OTIsImV4cCI6MjA4NzIzNDQ5Mn0.lKrOXOLQtHDBhRgH6kz_t8admjaA_WR1bs_pIIwq0wM');

async function insert() {
    const { data, error } = await supabase.from('ecom_templates').insert([
        {
            folder: "amazon-style",
            name: "Grand Bazaar (Amazon Style)",
            description: "High-density retail design with global search emphasis, horizontal hierarchy, and optimized SKU density. Perfect for electronics, groceries, and large catalogs.",
            version: "1.0.0",
            preview_image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=900",
            color: "#febd69",
            tags: ["retail", "ecommerce"],
            category: "Retail",
            is_active: true,
            sort_order: 2
        }
    ]);
    if (error) console.error(error);
    else console.log("Template registered successfully");
}
insert();
