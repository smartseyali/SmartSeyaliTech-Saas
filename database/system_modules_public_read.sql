-- Allow the marketing site (anon role) to read active modules so
-- individual-app pricing can be displayed without authentication.

DROP POLICY IF EXISTS "system_modules_public_read" ON public.system_modules;

CREATE POLICY "system_modules_public_read"
    ON public.system_modules
    FOR SELECT
    USING (is_active = true);
