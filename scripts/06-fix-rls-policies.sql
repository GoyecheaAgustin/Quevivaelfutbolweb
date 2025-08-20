-- Eliminar todas las políticas existentes para empezar limpio
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;
DROP POLICY IF EXISTS "Allow service role full access" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to read" ON users;
DROP POLICY IF EXISTS "Allow users to insert" ON users;
DROP POLICY IF EXISTS "Allow users to update own data" ON users;

DROP POLICY IF EXISTS "Students can view own data" ON students;
DROP POLICY IF EXISTS "Admins can manage all students" ON students;
DROP POLICY IF EXISTS "Service role can manage students" ON students;
DROP POLICY IF EXISTS "Allow service role full access" ON students;
DROP POLICY IF EXISTS "Allow authenticated users to read" ON students;
DROP POLICY IF EXISTS "Allow users to insert" ON students;
DROP POLICY IF EXISTS "Allow users to update own data" ON students;

-- Deshabilitar RLS temporalmente para permitir inserciones
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- Crear políticas más simples y permisivas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla users
CREATE POLICY "Allow all operations for service role" ON users
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read all" ON users
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow users to update own profile" ON users
FOR UPDATE 
TO authenticated
USING (auth.uid()::text = auth_id)
WITH CHECK (auth.uid()::text = auth_id);

-- Políticas para la tabla students
CREATE POLICY "Allow all operations for service role" ON students
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read all" ON students
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow users to update own student data" ON students
FOR UPDATE 
TO authenticated
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

-- Asegurar que las tablas tengan los permisos correctos
GRANT ALL ON users TO service_role;
GRANT ALL ON students TO service_role;
GRANT SELECT ON users TO authenticated;
GRANT SELECT ON students TO authenticated;
GRANT UPDATE ON users TO authenticated;
GRANT UPDATE ON students TO authenticated;
