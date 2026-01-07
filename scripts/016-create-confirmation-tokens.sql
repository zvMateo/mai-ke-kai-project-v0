-- Script para crear tabla de tokens de confirmación de email
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS email_confirmation_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  resend_count INTEGER DEFAULT 0,
  last_resend_at TIMESTAMPTZ
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_confirmation_tokens_token ON email_confirmation_tokens(token);
CREATE INDEX IF NOT EXISTS idx_confirmation_tokens_user ON email_confirmation_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_confirmation_tokens_expires ON email_confirmation_tokens(expires_at);

-- Función para limpiar tokens expirados (opcional, para cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_confirmation_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM email_confirmation_tokens WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_email_confirmation_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_email_confirmation_tokens_updated_at ON email_confirmation_tokens;
CREATE TRIGGER update_email_confirmation_tokens_updated_at
  BEFORE UPDATE ON email_confirmation_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_email_confirmation_tokens_updated_at();

COMMENT ON TABLE email_confirmation_tokens IS 'Tokens para confirmación de email de usuarios';
COMMENT ON COLUMN email_confirmation_tokens.user_id IS 'ID del usuario en auth.users';
COMMENT ON COLUMN email_confirmation_tokens.token IS 'Token único de confirmación';
COMMENT ON COLUMN email_confirmation_tokens.expires_at IS 'Fecha de expiración del token (24 horas desde creación)';
COMMENT ON COLUMN email_confirmation_tokens.resend_count IS 'Número de veces que se ha reenviado el email';
