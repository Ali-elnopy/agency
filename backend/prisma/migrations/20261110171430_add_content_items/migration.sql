-- CreateTable
CREATE TABLE "content_items" (
    "id" SERIAL NOT NULL,
    "content_plan_id" INTEGER NOT NULL,
    "campaign_id" INTEGER,
    "created_by" INTEGER NOT NULL,
    "scheduled_date" TIMESTAMPTZ(6) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "reference" TEXT,
    "tone_of_voice" TEXT,
    "caption" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "content_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "content_items_content_plan_id_idx" ON "content_items"("content_plan_id");

-- CreateIndex
CREATE INDEX "content_items_campaign_id_idx" ON "content_items"("campaign_id");

-- CreateIndex
CREATE INDEX "content_items_created_by_idx" ON "content_items"("created_by");

-- CreateIndex
CREATE INDEX "content_items_scheduled_date_idx" ON "content_items"("scheduled_date");

-- AddForeignKey
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_content_plan_id_fkey" FOREIGN KEY ("content_plan_id") REFERENCES "content_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
