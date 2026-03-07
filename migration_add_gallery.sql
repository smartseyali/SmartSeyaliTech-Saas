-- Migration to add gallery_images to system_templates if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='system_templates' AND column_name='gallery_images') THEN
        ALTER TABLE public.system_templates ADD COLUMN gallery_images TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Update existing records with sample gallery images
UPDATE public.system_templates SET gallery_images = ARRAY['https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?q=80&w=900', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=900', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=900'] WHERE folder = 'amazon-style';
UPDATE public.system_templates SET gallery_images = ARRAY['https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=900', 'https://images.unsplash.com/photo-1466632311177-a3d1433f95e8?q=80&w=900', 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?q=80&w=900'] WHERE folder = 'fruitables';
UPDATE public.system_templates SET gallery_images = ARRAY['https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=900', 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=900', 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=900'] WHERE folder = 'modern-shop';
