-- AlterEnum
ALTER TYPE "InterviewType" ADD VALUE 'CASE_STUDY';

-- AlterTable
ALTER TABLE "InterviewSession" ADD COLUMN     "durationMinutes" INTEGER NOT NULL DEFAULT 30;
