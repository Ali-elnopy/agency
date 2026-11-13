-- CreateIndex
CREATE UNIQUE INDEX "content_plans_brand_id_platform_account_id_year_month_key"
ON "content_plans"("brand_id", "platform_account_id", "year", "month");