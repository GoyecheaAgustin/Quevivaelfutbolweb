-- Script final para configurar la base de datos correctamente

-- 1. Primero, eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;
DROP POLICY IF EXISTS "Allow service role full access" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to read" ON users;
DROP POLICY IF EXISTS "Allow users to insert" ON users;
DROP POLICY IF EXISTS "Allow users to update own data" ON users;
DROP POLICY IF EXISTS "Allow all operations for service role" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to read all" ON users;
DROP POLICY IF EXISTS "Allow users to update own profile" ON users;

DROP POLICY IF EXISTS "Students can view own data" ON students;
DROP POLICY IF EXISTS "Admins can manage all students" ON students;
DROP POLICY IF EXISTS "Service role can manage students" ON students;
DROP POLICY IF EXISTS "Allow service role full access" ON students;
DROP POLICY IF EXISTS "Allow authenticated users to read" ON students;
DROP POLICY IF EXISTS "Allow users to insert" ON students;
DROP POLICY IF EXISTS "Allow users to update own data" ON students;
DROP POLICY IF EXISTS "Allow all operations for service role" ON students;
DROP POLICY IF EXISTS "Allow authenticated users to read all" ON students;
DROP POLICY IF EXISTS "Allow users to update own student data" ON students;

-- 2. Asegurar que las tablas existen con la estructura correcta
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_id TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'coach', 'student')),
    status TEXT NOT NULL DEFAULT 'moroso' CHECK (status IN ('active', 'inactive', 'moroso')),
    profile_completed BOOLEAN DEFAULT false,
    first_name TEXT,
    last_name TEXT,
    dob DATE,
    phone TEXT,
    parent_name TEXT,
    parent_phone TEXT,
    parent_email TEXT,
    address TEXT,
    category TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    dob DATE NOT NULL,
    category TEXT NOT NULL,
    status_pago TEXT NOT NULL DEFAULT 'moroso' CHECK (status_pago IN ('al_dia', 'moroso', 'exonerado')),
    phone TEXT,
    parent_name TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    parent_email TEXT,
    address TEXT,
    notes TEXT,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    qr_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas simples y funcionales

-- Políticas para users
CREATE POLICY "service_role_all_users" ON users
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "authenticated_read_users" ON users
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "users_update_own" ON users
    FOR UPDATE TO authenticated
    USING (auth.uid()::text = auth_id)
    WITH CHECK (auth.uid()::text = auth_id);

-- Políticas para students
CREATE POLICY "service_role_all_students" ON students
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "authenticated_read_students" ON students
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "students_update_own" ON students
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = students.user_id 
            AND users.auth_id = auth.uid()::text
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = students.user_id 
            AND users.auth_id = auth.uid()::text
        )
    );

-- 5. Asegurar permisos correctos
GRANT ALL ON users TO service_role;
GRANT ALL ON students TO service_role;
GRANT SELECT ON users TO authenticated;
GRANT SELECT ON students TO authenticated;
GRANT UPDATE ON users TO authenticated;
GRANT UPDATE ON students TO authenticated;

-- 6. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);

-- 7. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Triggers para updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
