/*
  Warnings:

  - You are about to drop the column `llmProvider` on the `InterviewSession` table. All the data in the column will be lost.
  - Made the column `title` on table `InterviewSession` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "InterviewSession_userId_idx";

-- AlterTable
ALTER TABLE "InterviewSession" DROP COLUMN "llmProvider",
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';
