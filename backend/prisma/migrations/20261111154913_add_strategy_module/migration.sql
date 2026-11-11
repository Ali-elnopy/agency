-- CreateTable
CREATE TABLE "strategies" (
    "id" SERIAL NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "strategies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategy_versions" (
    "id" SERIAL NOT NULL,
    "strategy_id" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "storage_key" VARCHAR(500) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    "file_size" INTEGER NOT NULL,
    "uploaded_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strategy_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategy_feedback" (
    "id" SERIAL NOT NULL,
    "version_id" INTEGER NOT NULL,
    "requested_by" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMPTZ(6),

    CONSTRAINT "strategy_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategy_approvals" (
    "id" SERIAL NOT NULL,
    "version_id" INTEGER NOT NULL,
    "approver_id" INTEGER NOT NULL,
    "approver_type" VARCHAR(30) NOT NULL,
    "decision" VARCHAR(20) NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strategy_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "strategies_brand_id_idx" ON "strategies"("brand_id");

-- CreateIndex
CREATE INDEX "strategies_status_idx" ON "strategies"("status");

-- CreateIndex
CREATE INDEX "strategy_versions_uploaded_by_id_idx" ON "strategy_versions"("uploaded_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "strategy_versions_strategy_id_version_key" ON "strategy_versions"("strategy_id", "version");

-- CreateIndex
CREATE INDEX "strategy_feedback_version_id_idx" ON "strategy_feedback"("version_id");

-- CreateIndex
CREATE INDEX "strategy_feedback_requested_by_idx" ON "strategy_feedback"("requested_by");

-- CreateIndex
CREATE INDEX "strategy_feedback_status_idx" ON "strategy_feedback"("status");

-- CreateIndex
CREATE INDEX "strategy_approvals_approver_id_idx" ON "strategy_approvals"("approver_id");

-- CreateIndex
CREATE UNIQUE INDEX "strategy_approvals_version_id_approver_type_key" ON "strategy_approvals"("version_id", "approver_type");

-- AddForeignKey
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategy_versions" ADD CONSTRAINT "strategy_versions_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "strategies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategy_versions" ADD CONSTRAINT "strategy_versions_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategy_feedback" ADD CONSTRAINT "strategy_feedback_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "strategy_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategy_feedback" ADD CONSTRAINT "strategy_feedback_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategy_approvals" ADD CONSTRAINT "strategy_approvals_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "strategy_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategy_approvals" ADD CONSTRAINT "strategy_approvals_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
