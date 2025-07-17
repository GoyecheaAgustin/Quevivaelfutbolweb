-- Agregar campos para el sistema de aprobación de pagos
ALTER TABLE fees ADD COLUMN IF NOT EXISTS payment_proof_url VARCHAR(500);
ALTER TABLE fees ADD COLUMN IF NOT EXISTS payment_proof_filename VARCHAR(255);
ALTER TABLE fees ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);
ALTER TABLE fees ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE fees ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Actualizar los estados de pago para incluir 'pending_approval'
ALTER TABLE fees DROP CONSTRAINT IF EXISTS fees_status_check;
ALTER TABLE fees ADD CONSTRAINT fees_status_check 
  CHECK (status IN ('pending', 'pending_approval', 'paid', 'overdue', 'rejected'));

-- Crear tabla para notificaciones de pagos
CREATE TABLE IF NOT EXISTS payment_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fee_id UUID REFERENCES fees(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('payment_uploaded', 'payment_approved', 'payment_rejected')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_fees_status_approval ON fees(status) WHERE status = 'pending_approval';
CREATE INDEX IF NOT EXISTS idx_payment_notifications_student ON payment_notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_notifications_unread ON payment_notifications(read) WHERE read = FALSE;
