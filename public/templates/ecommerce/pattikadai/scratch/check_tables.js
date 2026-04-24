const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://supabase.smartseyali.tech';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzc1MjAwNTc2LCJleHAiOjIwOTA1NjA1NzZ9.AdbwGkMtZ-aOXM4wlIQ_ZzRTFsJV3i_bIGoTvGb_iDo';
const supabase = createClient(supabaseUrl, supabaseKey);

const tables = [
  'ecom_shipping_charges',
  'ecom_shipping_zones',
  'ecom_shipping_rates',
  'ecom_shipping_slabs',
  'ecom_delivery_charges',
  'ecom_delivery_rates',
  'master_shipping_charges',
  'master_shipping_rates'
];

async function check() {
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (!error) {
      console.log(`Table ${table} exists. Data:`, JSON.stringify(data));
    } else {
      if (error.code !== 'PGRST205') {
        console.log(`Table ${table} might exist but returned error:`, error.message);
      }
    }
  }
}

check();
