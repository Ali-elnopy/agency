-- CreateTable
CREATE TABLE "campaigns" (
    "id" SERIAL NOT NULL,
    "content_plan_id" INTEGER NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "objective" TEXT,
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaigns_content_plan_id_idx" ON "campaigns"("content_plan_id");

-- CreateIndex
CREATE INDEX "campaigns_created_by_idx" ON "campaigns"("created_by");

-- CreateIndex
CREATE INDEX "campaigns_start_date_end_date_idx" ON "campaigns"("start_date", "end_date");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_content_plan_id_fkey" FOREIGN KEY ("content_plan_id") REFERENCES "content_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
