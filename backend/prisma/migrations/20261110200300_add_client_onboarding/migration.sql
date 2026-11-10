
-- CreateTable
CREATE TABLE "client_onboardings" (
    "id" SERIAL NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "main_category" VARCHAR(30) NOT NULL,
    "activity_type" VARCHAR(50) NOT NULL,
    "template_version" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "client_onboardings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_answers" (
    "id" SERIAL NOT NULL,
    "onboarding_id" INTEGER NOT NULL,
    "question_code" VARCHAR(100) NOT NULL,
    "answer" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "onboarding_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_onboardings_brand_id_key" ON "client_onboardings"("brand_id");

-- CreateIndex
CREATE INDEX "client_onboardings_status_idx" ON "client_onboardings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_answers_onboarding_id_question_code_key" ON "onboarding_answers"("onboarding_id", "question_code");

-- AddForeignKey
ALTER TABLE "client_onboardings"
ADD CONSTRAINT "client_onboardings_brand_id_fkey"
FOREIGN KEY ("brand_id") REFERENCES "brands"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_answers"
ADD CONSTRAINT "onboarding_answers_onboarding_id_fkey"
FOREIGN KEY ("onboarding_id") REFERENCES "client_onboardings"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
