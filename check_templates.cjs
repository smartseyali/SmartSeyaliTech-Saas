
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vxwjfonhadjjbdmkdrjc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4d2pmb25oYWRqamJkbWtkcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NTg0OTIsImV4cCI6MjA4NzIzNDQ5Mn0.lKrOXOLQtHDBhRgH6kz_t8admjaA_WR1bs_pIIwq0wM');

async function check() {
    const { data, error } = await supabase.from('ecom_templates').select('*');
    if (error) console.error(error);
    else console.log(JSON.stringify(data, null, 2));
}
check();
