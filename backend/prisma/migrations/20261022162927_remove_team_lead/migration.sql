/*
  Warnings:

  - You are about to drop the column `team_lead_id` on the `teams` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "teams" DROP CONSTRAINT "teams_team_lead_id_fkey";

-- DropIndex
DROP INDEX "teams_team_lead_id_idx";

-- AlterTable
ALTER TABLE "teams" DROP COLUMN "team_lead_id";
