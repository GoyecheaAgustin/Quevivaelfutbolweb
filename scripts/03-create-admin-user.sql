-- Limpiar datos de prueba existentes
DELETE FROM attendance;
DELETE FROM fees;
DELETE FROM news;
DELETE FROM users;


-- Crear tu usuario administrador
-- Email: nitsuga022@gmail.com
-- Contraseña: FutbolBeto2024!
-- Hash generado con bcrypt para la contraseña: FutbolBeto2024!
INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES 
  ('admin-001-2024', 'nitsuga022@gmail.com', '$2a$10$rOzWqQQXQXQXQXQXQXQXQeJ8K9K9K9K9K9K9K9K9K9K9K9K9K9K9K9', 'admin', NOW(), NOW());

-- Insertar una noticia de bienvenida
INSERT INTO news (id, title, content, author_id, published, created_at, updated_at) VALUES 
  ('news-welcome-001', 
   'Bienvenido al Sistema de Gestión', 
   'Sistema inicializado correctamente. Ya puedes comenzar a gestionar tu escuela de fútbol. Recuerda crear usuarios para tus entrenadores desde la sección de Gestión de Usuarios.',
   'admin-001-2024', 
   true, 
   NOW(), 
   NOW());

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
