-- Add content submission fields and index to tasks table.
ALTER TABLE "tasks"
  ADD COLUMN IF NOT EXISTS "submission_url" TEXT,
  ADD COLUMN IF NOT EXISTS "submission_notes" TEXT,
  ADD COLUMN IF NOT EXISTS "submitted_at" TIMESTAMPTZ(6);

CREATE INDEX IF NOT EXISTS "tasks_submitted_at_idx"
  ON "tasks" ("submitted_at");
