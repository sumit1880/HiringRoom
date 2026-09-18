-- Enable pgvector so similarity search can run natively in Postgres
-- instead of pulling every embedding into the app and scoring in JS.
CREATE EXTENSION IF NOT EXISTS vector;

-- The previous ResumeChunk rows are scoped only by userId, with no way
-- to attribute a chunk to a specific resume (and no cascade delete from
-- Resume, so deleted resumes' chunks were orphaned). That data cannot be
-- safely backfilled with a resumeId, so it is cleared here — it will be
-- regenerated the next time a user uploads/re-processes a resume.
TRUNCATE TABLE "ResumeChunk";

-- Drop the old Float[] embedding column and app-side-only similarity
-- scoring in favor of a native pgvector column.
ALTER TABLE "ResumeChunk" DROP COLUMN "embedding";
ALTER TABLE "ResumeChunk" ADD COLUMN "embedding" vector(768);

-- Scope every chunk to the resume it was extracted from.
ALTER TABLE "ResumeChunk" ADD COLUMN "resumeId" TEXT NOT NULL;

CREATE INDEX "ResumeChunk_resumeId_idx" ON "ResumeChunk"("resumeId");

ALTER TABLE "ResumeChunk"
ADD CONSTRAINT "ResumeChunk_resumeId_fkey"
FOREIGN KEY ("resumeId")
REFERENCES "Resume"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Approximate-nearest-neighbor index for cosine similarity search
-- (`<=>` operator). ivfflat needs data present to build well-balanced
-- lists; it still works correctly on an empty/small table and will keep
-- being useful as chunks are added. Re-running `ANALYZE` after bulk
-- loads is recommended for large deployments.
CREATE INDEX "ResumeChunk_embedding_cosine_idx"
ON "ResumeChunk"
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Optional job description to tailor interview question generation
-- toward a specific role.
ALTER TABLE "InterviewSession" ADD COLUMN "jobDescription" TEXT;
