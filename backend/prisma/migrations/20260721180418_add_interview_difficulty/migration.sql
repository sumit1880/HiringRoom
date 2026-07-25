-- CreateEnum
CREATE TYPE "InterviewDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "InterviewSession" ADD COLUMN     "difficulty" "InterviewDifficulty" NOT NULL DEFAULT 'MEDIUM';
