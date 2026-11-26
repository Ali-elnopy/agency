-- Add publishing tracking fields to content_items.
ALTER TABLE "content_items"
  ADD COLUMN IF NOT EXISTS "publish_status" VARCHAR(30) NOT NULL DEFAULT 'NOT_PUBLISHED',
  ADD COLUMN IF NOT EXISTS "published_at" TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS "publish_url" TEXT,
  ADD COLUMN IF NOT EXISTS "published_by" INTEGER,
  ADD COLUMN IF NOT EXISTS "publish_notes" TEXT;

CREATE INDEX IF NOT EXISTS "content_items_publish_status_idx"
  ON "content_items" ("publish_status");

CREATE INDEX IF NOT EXISTS "content_items_published_at_idx"
  ON "content_items" ("published_at");

ALTER TABLE "content_items"
  ADD CONSTRAINT "content_items_published_by_fkey"
  FOREIGN KEY ("published_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create content_item_revisions table for Revision History.
CREATE TABLE IF NOT EXISTS "content_item_revisions" (
    "id" SERIAL NOT NULL,
    "content_item_id" INTEGER NOT NULL,
    "revision_number" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "scheduled_date" TIMESTAMPTZ(6) NOT NULL,
    "reference" TEXT,
    "tone_of_voice" TEXT,
    "caption" TEXT,
    "notes" TEXT,
    "submission_url" TEXT,
    "submission_notes" TEXT,
    "source" VARCHAR(40) NOT NULL DEFAULT 'CONTENT_UPDATE',
    "change_reason" TEXT,
    "task_id" INTEGER,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_item_revisions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "content_item_revisions_content_item_id_revision_number_key"
  ON "content_item_revisions" ("content_item_id", "revision_number");

CREATE INDEX IF NOT EXISTS "content_item_revisions_content_item_id_created_at_idx"
  ON "content_item_revisions" ("content_item_id", "created_at");

CREATE INDEX IF NOT EXISTS "content_item_revisions_created_by_idx"
  ON "content_item_revisions" ("created_by");

ALTER TABLE "content_item_revisions"
  ADD CONSTRAINT "content_item_revisions_content_item_id_fkey"
  FOREIGN KEY ("content_item_id") REFERENCES "content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "content_item_revisions"
  ADD CONSTRAINT "content_item_revisions_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add reporting indexes on tasks for Progress Tracking and Team Performance.
CREATE INDEX IF NOT EXISTS "tasks_assigned_to_status_idx"
  ON "tasks" ("assigned_to", "status");

CREATE INDEX IF NOT EXISTS "tasks_created_at_idx"
  ON "tasks" ("created_at");

CREATE INDEX IF NOT EXISTS "tasks_completed_at_idx"
  ON "tasks" ("completed_at");
