/*
  Warnings:

  - You are about to drop the `password_reset_tokens` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[client_id]` on the table `brands` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "password_reset_tokens_user_id_fkey";

-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "client_id" INTEGER;

-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "team_lead_id" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "username" VARCHAR(50);

-- DropTable
DROP TABLE "password_reset_tokens";

-- CreateIndex
CREATE UNIQUE INDEX "brands_client_id_key" ON "brands"("client_id");

-- CreateIndex
CREATE INDEX "teams_team_lead_id_idx" ON "teams"("team_lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_team_lead_id_fkey" FOREIGN KEY ("team_lead_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brands" ADD CONSTRAINT "brands_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
