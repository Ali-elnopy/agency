-- CreateTable
CREATE TABLE "brand_briefs" (
    "id" SERIAL NOT NULL,
    "onboarding_id" INTEGER NOT NULL,
    "generated_by_id" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" VARCHAR(20) NOT NULL DEFAULT 'GENERATING',
    "content" JSONB,
    "source_snapshot" JSONB,
    "model_name" VARCHAR(100),
    "prompt_version" VARCHAR(20) NOT NULL,
    "error_message" TEXT,
    "generated_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "brand_briefs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "brand_briefs_status_idx" ON "brand_briefs"("status");

-- CreateIndex
CREATE INDEX "brand_briefs_generated_by_id_idx" ON "brand_briefs"("generated_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "brand_briefs_onboarding_id_version_key" ON "brand_briefs"("onboarding_id", "version");

-- AddForeignKey
ALTER TABLE "brand_briefs" ADD CONSTRAINT "brand_briefs_onboarding_id_fkey" FOREIGN KEY ("onboarding_id") REFERENCES "client_onboardings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_briefs" ADD CONSTRAINT "brand_briefs_generated_by_id_fkey" FOREIGN KEY ("generated_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
