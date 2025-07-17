-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'admin', 'coach')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de estudiantes
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  phone VARCHAR(20),
  parent_name VARCHAR(200),
  parent_phone VARCHAR(20),
  address TEXT,
  category VARCHAR(50),
  enrollment_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  qr_code VARCHAR(255) UNIQUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de cuotas
CREATE TABLE IF NOT EXISTS fees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  month_year VARCHAR(7) NOT NULL, -- formato: 2024-01
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  payment_method VARCHAR(50),
  payment_date TIMESTAMP,
  payment_proof_url VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de asistencia
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  present BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de noticias
CREATE TABLE IF NOT EXISTS news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id),
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_fees_student_id ON fees(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_status ON fees(status);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);

-- Insertar usuarios de prueba
INSERT INTO users (id, email, password_hash, role) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@escuela.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
  ('550e8400-e29b-41d4-a716-446655440002', 'alumno@escuela.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
  ('550e8400-e29b-41d4-a716-446655440003', 'entrenador@escuela.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'coach');

-- Insertar datos de estudiante de prueba
INSERT INTO users (id, user_id, first_name, last_name, date_of_birth, phone, parent_name, parent_phone, address, category, qr_code) VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Juan', 'Pérez', '2010-05-15', '1234567890', 'María Pérez', '0987654321', 'Av. Principal 123', 'Sub-15', 'STU-001-2024');

-- Insertar cuotas de prueba
INSERT INTO fees (student_id, amount, due_date, month_year, status, payment_date) VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', 15000.00, '2024-01-15', '2024-01', 'paid', '2024-01-10 10:30:00'),
  ('660e8400-e29b-41d4-a716-446655440001', 15000.00, '2024-02-15', '2024-02', 'pending', NULL);

-- Insertar noticias de prueba
INSERT INTO news (title, content, author_id, published) VALUES 
  ('Entrenamiento Suspendido', 'El entrenamiento del viernes 9 de febrero queda suspendido por lluvia. Se reprogramará para el sábado.', '550e8400-e29b-41d4-a716-446655440001', true),
  ('Torneo Interno', 'Se realizará un torneo interno el próximo sábado 17 de febrero. ¡Todos los alumnos están invitados!', '550e8400-e29b-41d4-a716-446655440001', true);
