-- CreateTable
CREATE TABLE "platform_accounts" (
    "id" SERIAL NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "platform" VARCHAR(30) NOT NULL,
    "account_name" VARCHAR(200) NOT NULL,
    "account_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "platform_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_plans" (
    "id" SERIAL NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "platform_account_id" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "year" SMALLINT NOT NULL,
    "month" SMALLINT NOT NULL,
    "monthly_goals" TEXT,
    "notes" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "content_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "platform_accounts_brand_id_idx"
ON "platform_accounts"("brand_id");

-- CreateIndex
CREATE INDEX "content_plans_brand_id_idx"
ON "content_plans"("brand_id");

-- CreateIndex
CREATE INDEX "content_plans_platform_account_id_idx"
ON "content_plans"("platform_account_id");

-- CreateIndex
CREATE INDEX "content_plans_created_by_idx"
ON "content_plans"("created_by");

-- CreateIndex
CREATE INDEX "content_plans_year_month_idx"
ON "content_plans"("year", "month");

-- AddForeignKey
ALTER TABLE "platform_accounts"
ADD CONSTRAINT "platform_accounts_brand_id_fkey"
FOREIGN KEY ("brand_id") REFERENCES "brands"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_plans"
ADD CONSTRAINT "content_plans_brand_id_fkey"
FOREIGN KEY ("brand_id") REFERENCES "brands"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_plans"
ADD CONSTRAINT "content_plans_platform_account_id_fkey"
FOREIGN KEY ("platform_account_id") REFERENCES "platform_accounts"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_plans"
ADD CONSTRAINT "content_plans_created_by_fkey"
FOREIGN KEY ("created_by") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;