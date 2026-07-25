/*
  Warnings:

  - The `strengths` column on the `QuestionEvaluation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `weaknesses` column on the `QuestionEvaluation` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "QuestionEvaluation" DROP COLUMN "strengths",
ADD COLUMN     "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "weaknesses",
ADD COLUMN     "weaknesses" TEXT[] DEFAULT ARRAY[]::TEXT[];
