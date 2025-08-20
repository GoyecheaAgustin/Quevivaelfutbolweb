-- Configuración completa de la base de datos
-- Ejecutar después de crear las tablas básicas

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;

CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth_id = auth.uid());

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth_id = auth.uid());

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- Políticas para la tabla students
DROP POLICY IF EXISTS "Students can view own data" ON students;
DROP POLICY IF EXISTS "Students can update own data" ON students;
DROP POLICY IF EXISTS "Staff can view all students" ON students;
DROP POLICY IF EXISTS "Staff can manage students" ON students;

CREATE POLICY "Students can view own data" ON students
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Students can update own data" ON students
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Staff can view all students" ON students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role IN ('admin', 'coach')
        )
    );

CREATE POLICY "Staff can manage students" ON students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role IN ('admin', 'coach')
        )
    );

-- Políticas para la tabla payments
DROP POLICY IF EXISTS "Students can view own payments" ON payments;
DROP POLICY IF EXISTS "Staff can view all payments" ON payments;
DROP POLICY IF EXISTS "Staff can manage payments" ON payments;

CREATE POLICY "Students can view own payments" ON payments
    FOR SELECT USING (
        student_id IN (
            SELECT s.id FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE u.auth_id = auth.uid()
        )
    );

CREATE POLICY "Staff can view all payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role IN ('admin', 'coach')
        )
    );

CREATE POLICY "Staff can manage payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role IN ('admin', 'coach')
        )
    );

-- Políticas para la tabla attendance
DROP POLICY IF EXISTS "Students can view own attendance" ON attendance;
DROP POLICY IF EXISTS "Staff can view all attendance" ON attendance;
DROP POLICY IF EXISTS "Staff can manage attendance" ON attendance;

CREATE POLICY "Students can view own attendance" ON attendance
    FOR SELECT USING (
        student_id IN (
            SELECT s.id FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE u.auth_id = auth.uid()
        )
    );

CREATE POLICY "Staff can view all attendance" ON attendance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role IN ('admin', 'coach')
        )
    );

CREATE POLICY "Staff can manage attendance" ON attendance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role IN ('admin', 'coach')
        )
    );

-- Políticas para la tabla news
DROP POLICY IF EXISTS "Everyone can view published news" ON news;
DROP POLICY IF EXISTS "Staff can manage news" ON news;

CREATE POLICY "Everyone can view published news" ON news
    FOR SELECT USING (published = true);

CREATE POLICY "Staff can manage news" ON news
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role IN ('admin', 'coach')
        )
    );

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar timestamps automáticamente
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

-- Verificar que todo esté configurado correctamente
DO $$
BEGIN
    RAISE NOTICE 'Base de datos configurada correctamente';
    RAISE NOTICE 'RLS habilitado en todas las tablas';
    RAISE NOTICE 'Políticas de seguridad creadas';
    RAISE NOTICE 'Índices creados para mejorar rendimiento';
END $$;
