-- Separate the short-lived email OTP from the single-use password-reset token,
-- and track verification attempts / resend timing per reset request.

ALTER TABLE "password_reset_tokens"
  ADD COLUMN IF NOT EXISTS "attempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "verified_at" TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS "reset_token_hash" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "reset_token_expires_at" TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS "last_sent_at" TIMESTAMPTZ(6);

-- A reset token hash must be globally unique, while the column stays nullable
-- for records that have not completed OTP verification yet.
CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_reset_token_hash_key"
  ON "password_reset_tokens" ("reset_token_hash");

-- Speeds up "latest code for this user" lookups used by verify/resend.
CREATE INDEX IF NOT EXISTS "password_reset_tokens_user_id_created_at_idx"
  ON "password_reset_tokens" ("user_id", "created_at");
