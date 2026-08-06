-- CreateEnum
CREATE TYPE "QuestionStrategy" AS ENUM ('OPENING', 'FOLLOW_UP', 'NEW_TOPIC', 'SIMPLIFY');

-- AlterTable
ALTER TABLE "InterviewQuestion" ADD COLUMN     "strategy" "QuestionStrategy",
ADD COLUMN     "topic" TEXT;

-- AlterTable
ALTER TABLE "InterviewSession" ADD COLUMN     "consecutiveStruggles" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "coveredTopics" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "QuestionEvaluation" ADD COLUMN     "isWeakAnswer" BOOLEAN NOT NULL DEFAULT false;
