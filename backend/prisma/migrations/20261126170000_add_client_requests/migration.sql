
-- CreateTable
CREATE TABLE "client_requests" (
    "id" SERIAL NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "client_id" INTEGER NOT NULL,
    "account_manager_id" INTEGER NOT NULL,
    "employee_id" INTEGER,
    "type" VARCHAR(30) NOT NULL,
    "description" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "related_task_id" INTEGER,
    "resolved_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "client_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_requests_related_task_id_key"
ON "client_requests"("related_task_id");

CREATE INDEX "client_requests_brand_id_idx"
ON "client_requests"("brand_id");

CREATE INDEX "client_requests_client_id_idx"
ON "client_requests"("client_id");

CREATE INDEX "client_requests_account_manager_id_idx"
ON "client_requests"("account_manager_id");

CREATE INDEX "client_requests_employee_id_idx"
ON "client_requests"("employee_id");

CREATE INDEX "client_requests_status_idx"
ON "client_requests"("status");

CREATE INDEX "client_requests_created_at_idx"
ON "client_requests"("created_at");

-- AddForeignKey
ALTER TABLE "client_requests"
ADD CONSTRAINT "client_requests_brand_id_fkey"
FOREIGN KEY ("brand_id") REFERENCES "brands"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "client_requests"
ADD CONSTRAINT "client_requests_client_id_fkey"
FOREIGN KEY ("client_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "client_requests"
ADD CONSTRAINT "client_requests_account_manager_id_fkey"
FOREIGN KEY ("account_manager_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "client_requests"
ADD CONSTRAINT "client_requests_employee_id_fkey"
FOREIGN KEY ("employee_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "client_requests"
ADD CONSTRAINT "client_requests_related_task_id_fkey"
FOREIGN KEY ("related_task_id") REFERENCES "tasks"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
