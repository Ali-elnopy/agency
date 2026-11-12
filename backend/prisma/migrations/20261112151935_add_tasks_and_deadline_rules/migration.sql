-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "content_item_id" INTEGER,
    "type" VARCHAR(30) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "assigned_to" INTEGER NOT NULL,
    "created_by" INTEGER NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'TODO',
    "priority" VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
    "planned_deadline" TIMESTAMPTZ(6) NOT NULL,
    "effective_deadline" TIMESTAMPTZ(6),
    "started_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "depends_on_task_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_deadline_rules" (
    "id" SERIAL NOT NULL,
    "content_type" VARCHAR(50) NOT NULL,
    "task_type" VARCHAR(30) NOT NULL,
    "offset_minutes" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "task_deadline_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tasks_content_item_id_idx" ON "tasks"("content_item_id");

-- CreateIndex
CREATE INDEX "tasks_assigned_to_idx" ON "tasks"("assigned_to");

-- CreateIndex
CREATE INDEX "tasks_created_by_idx" ON "tasks"("created_by");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_priority_idx" ON "tasks"("priority");

-- CreateIndex
CREATE INDEX "tasks_planned_deadline_idx" ON "tasks"("planned_deadline");

-- CreateIndex
CREATE INDEX "tasks_effective_deadline_idx" ON "tasks"("effective_deadline");

-- CreateIndex
CREATE INDEX "tasks_depends_on_task_id_idx" ON "tasks"("depends_on_task_id");

-- CreateIndex
CREATE INDEX "task_deadline_rules_content_type_idx" ON "task_deadline_rules"("content_type");

-- CreateIndex
CREATE INDEX "task_deadline_rules_task_type_idx" ON "task_deadline_rules"("task_type");

-- CreateIndex
CREATE UNIQUE INDEX "task_deadline_rules_content_type_task_type_key" ON "task_deadline_rules"("content_type", "task_type");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_depends_on_task_id_fkey" FOREIGN KEY ("depends_on_task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
