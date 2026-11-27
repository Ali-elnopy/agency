-- Add external attachment/material link to content items.
ALTER TABLE "content_items"
  ADD COLUMN IF NOT EXISTS "material_url" TEXT;

ALTER TABLE "content_item_revisions"
  ADD COLUMN IF NOT EXISTS "material_url" TEXT;
