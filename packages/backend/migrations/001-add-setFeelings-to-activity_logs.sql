-- Adiciona coluna setFeelings na tabela activity_logs
-- Armazena sentimentos por serie: easy, ok, hard, very_hard (formato simple-array: "easy,ok,hard")
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS "setFeelings" text;
