-- Drop the ivfflat index as exact search is preferred for small datasets
DROP INDEX IF EXISTS "ResumeChunk_embedding_cosine_idx";
