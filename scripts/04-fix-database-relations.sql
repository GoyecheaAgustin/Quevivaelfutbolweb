-- Crear las tablas con las relaciones correctas
-- Primero eliminar las tablas existentes si hay problemas de estructura
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS fees CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Crear tabla de usuarios
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'admin', 'coach')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de estudiantes con relación correcta a users
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  phone VARCHAR(20),
  parent_name VARCHAR(200),
  parent_phone VARCHAR(20),
  parent_email VARCHAR(255),
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
CREATE TABLE fees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  month_year VARCHAR(7) NOT NULL, -- formato: 2024-01
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'pending_approval', 'paid', 'overdue', 'rejected')),
  payment_method VARCHAR(50),
  payment_date TIMESTAMP,
  payment_proof_url VARCHAR(500),
  payment_proof_filename VARCHAR(255),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de asistencia
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  present BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de noticias
CREATE TABLE news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id),
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para mejorar performance
CREATE INDEX idx_users_user_id ON students(user_id);
CREATE INDEX idx_fees_student_id ON fees(student_id);
CREATE INDEX idx_fees_status ON fees(status);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Insertar usuario administrador
INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES 
  ('admin-001-2024', 'nitsuga022@gmail.com', '$2a$10$rOzWqQQXQXQXQXQXQXQXQeJ8K9K9K9K9K9K9K9K9K9K9K9K9K9K9K9', 'admin', NOW(), NOW());

-- Insertar una noticia de bienvenida
INSERT INTO news (id, title, content, author_id, published, created_at, updated_at) VALUES 
  ('news-welcome-001', 
   'Sistema Inicializado', 
   'El sistema ha sido configurado correctamente. Las tablas y relaciones están funcionando. Ya puedes comenzar a gestionar estudiantes y pagos.',
   'admin-001-2024', 
   true, 
   NOW(), 
   NOW());
