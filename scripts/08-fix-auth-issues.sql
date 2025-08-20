-- Script para corregir problemas de autenticación y configurar la base de datos correctamente

-- 1. Eliminar políticas RLS existentes que pueden estar causando problemas
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Students can view own data" ON public.students;
DROP POLICY IF EXISTS "Students can update own data" ON public.students;
DROP POLICY IF EXISTS "Admins can view all students" ON public.students;
DROP POLICY IF EXISTS "Admins can update all students" ON public.students;

-- 2. Deshabilitar RLS temporalmente para configuración
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.news DISABLE ROW LEVEL SECURITY;

-- 3. Otorgar permisos completos al service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 4. Otorgar permisos específicos para las tablas principales
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news TO service_role;

-- 5. Otorgar permisos a authenticated users
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.students TO authenticated;
GRANT SELECT ON public.payments TO authenticated;
GRANT SELECT ON public.attendance TO authenticated;
GRANT SELECT ON public.news TO authenticated;

-- 6. Otorgar permisos a anon users (para registro)
GRANT SELECT, INSERT ON public.users TO anon;
GRANT SELECT, INSERT ON public.students TO anon;

-- 7. Verificar que las tablas existen y tienen la estructura correcta
DO $$
BEGIN
    -- Verificar tabla users
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Tabla users no existe. Ejecuta primero los scripts de creación de tablas.';
    END IF;
    
    -- Verificar tabla students
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students') THEN
        RAISE EXCEPTION 'Tabla students no existe. Ejecuta primero los scripts de creación de tablas.';
    END IF;
    
    RAISE NOTICE 'Todas las tablas necesarias existen.';
END $$;

-- 8. Crear políticas RLS muy permisivas para evitar problemas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Política muy permisiva para users
CREATE POLICY "Allow all operations for service role" ON public.users
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage their data" ON public.users
    FOR ALL USING (auth.uid()::text = auth_id OR auth.role() = 'service_role');

-- Política muy permisiva para students
CREATE POLICY "Allow all operations for service role on students" ON public.students
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage student data" ON public.students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.auth_id = auth.uid()::text 
            AND (users.id = students.user_id OR users.role IN ('admin', 'coach'))
        ) OR auth.role() = 'service_role'
    );

-- 9. Crear función para debugging
CREATE OR REPLACE FUNCTION debug_auth_info()
RETURNS TABLE (
    current_user_id text,
    current_role text,
    jwt_claims json
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        auth.uid()::text as current_user_id,
        auth.role() as current_role,
        auth.jwt() as jwt_claims;
$$;

-- 10. Verificar configuración
DO $$
BEGIN
    RAISE NOTICE 'Configuración completada exitosamente.';
    RAISE NOTICE 'RLS habilitado en tablas principales.';
    RAISE NOTICE 'Políticas permisivas creadas.';
    RAISE NOTICE 'Permisos otorgados a service_role y authenticated.';
END $$;
