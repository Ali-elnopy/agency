-- Add client review status fields to content_items.
ALTER TABLE "content_items"
  ADD COLUMN IF NOT EXISTS "client_review_status" VARCHAR(30) NOT NULL DEFAULT 'NOT_READY',
  ADD COLUMN IF NOT EXISTS "client_approved_at" TIMESTAMPTZ(6);

CREATE INDEX IF NOT EXISTS "content_items_client_review_status_idx"
  ON "content_items" ("client_review_status");

-- Create client_change_requests table for Account Manager mediated client change requests.
CREATE TABLE IF NOT EXISTS "client_change_requests" (
    "id" SERIAL NOT NULL,
    "content_item_id" INTEGER NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "client_id" INTEGER NOT NULL,
    "account_manager_id" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "client_notes" TEXT NOT NULL,
    "account_manager_notes" TEXT,
    "related_task_id" INTEGER,
    "resolved_at" TIMESTAMPTZ(6),
    "forwarded_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "client_change_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "client_change_requests_related_task_id_key"
  ON "client_change_requests" ("related_task_id");

CREATE INDEX IF NOT EXISTS "client_change_requests_content_item_id_idx"
  ON "client_change_requests" ("content_item_id");

CREATE INDEX IF NOT EXISTS "client_change_requests_brand_id_idx"
  ON "client_change_requests" ("brand_id");

CREATE INDEX IF NOT EXISTS "client_change_requests_client_id_idx"
  ON "client_change_requests" ("client_id");

CREATE INDEX IF NOT EXISTS "client_change_requests_account_manager_id_idx"
  ON "client_change_requests" ("account_manager_id");

CREATE INDEX IF NOT EXISTS "client_change_requests_status_idx"
  ON "client_change_requests" ("status");

ALTER TABLE "client_change_requests"
  ADD CONSTRAINT "client_change_requests_content_item_id_fkey"
  FOREIGN KEY ("content_item_id") REFERENCES "content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "client_change_requests"
  ADD CONSTRAINT "client_change_requests_brand_id_fkey"
  FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "client_change_requests"
  ADD CONSTRAINT "client_change_requests_client_id_fkey"
  FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "client_change_requests"
  ADD CONSTRAINT "client_change_requests_account_manager_id_fkey"
  FOREIGN KEY ("account_manager_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "client_change_requests"
  ADD CONSTRAINT "client_change_requests_related_task_id_fkey"
  FOREIGN KEY ("related_task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
