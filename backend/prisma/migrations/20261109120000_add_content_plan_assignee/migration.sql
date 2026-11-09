-- Add an explicit assignee without changing existing content plan creators.
ALTER TABLE "content_plans"
ADD COLUMN "assigned_to_id" INTEGER;

CREATE INDEX "content_plans_assigned_to_id_idx"
ON "content_plans"("assigned_to_id");

ALTER TABLE "content_plans"
ADD CONSTRAINT "content_plans_assigned_to_id_fkey"
FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
