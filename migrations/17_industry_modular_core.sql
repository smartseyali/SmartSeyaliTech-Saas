-- Migration 17: Industry-Specific Modular Core
-- Expands the platform to support different industries with unique functional engines.

-- 1. Update Companies with Industry Branding
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS industry_type TEXT DEFAULT 'retail';
COMMENT ON COLUMN public.companies.industry_type IS 'retail, education, services, hospitality';

-- 2. Populate System Modules for different industries
INSERT INTO public.system_modules (name, is_core) VALUES 
('LMS Core', false),
('Student Admissions', false),
('Schedule Management', false),
('Product Inventory', false),
('Shipping & Logistics', false),
('Appointment Engine', false)
ON CONFLICT (name) DO NOTHING;

-- 3. Create Industry-Specific Metadata Schema for Products
-- This allows products to behave as courses, services, or physical items.
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 4. Create Students / Enrollment table for Education Industry
CREATE TABLE IF NOT EXISTS public.edu_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id BIGINT REFERENCES public.companies(id) ON DELETE CASCADE,
    course_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Student User
    status TEXT DEFAULT 'pending', -- pending, active, completed, dropped
    payment_status TEXT DEFAULT 'pending',
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id)
);

-- Enable RLS for new education tables
ALTER TABLE public.edu_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation" ON public.edu_enrollments
FOR ALL TO authenticated
USING (company_id IN (SELECT public.get_my_companies()) OR public.is_super_admin());

-- 5. Add missing audit columns to edu_enrollments
ALTER TABLE public.edu_enrollments ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.edu_enrollments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_set_updated_at ON public.edu_enrollments;
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.edu_enrollments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
