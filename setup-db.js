require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const sql = `
  -- Enable pgvector extension for RAG
  CREATE EXTENSION IF NOT EXISTS vector;

  -- 1. Logs table
  CREATE TABLE IF NOT EXISTS public.logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    service TEXT NOT NULL,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    meta JSONB
  );

  -- 2. Meetings table
  CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    meeting_id TEXT UNIQUE NOT NULL,
    title TEXT,
    video_url TEXT,
    audio_url TEXT,
    department TEXT,
    summary TEXT,
    contradictions TEXT[],
    started_at TIMESTAMP WITH TIME ZONE,
    transcript_text TEXT,
    agenda TEXT,
    agenda_label TEXT,
    agenda_score INTEGER,
    agenda_met BOOLEAN,
    outcome_score INTEGER,
    outcome_met BOOLEAN
  );

  -- 3. Decisions table
  CREATE TABLE IF NOT EXISTS public.decisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    meeting_id TEXT NOT NULL,
    speaker TEXT NOT NULL,
    content TEXT NOT NULL,
    department TEXT NOT NULL
  );

  -- 4. Meeting Chunks table (for RAG)
  CREATE TABLE IF NOT EXISTS public.meeting_chunks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    meeting_id TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    department TEXT NOT NULL
  );

  -- RAG Matching Function
  CREATE OR REPLACE FUNCTION match_meeting_chunks (
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    filter_dept text
  )
  RETURNS TABLE (
    id uuid,
    meeting_id text,
    content text,
    similarity float
  )
  LANGUAGE plpgsql
  AS $$
  BEGIN
    RETURN QUERY
    SELECT
      mc.id,
      mc.meeting_id,
      mc.content,
      1 - (mc.embedding <=> query_embedding) AS similarity
    FROM meeting_chunks mc
    WHERE mc.department = filter_dept
      AND 1 - (mc.embedding <=> query_embedding) > match_threshold
    ORDER BY mc.embedding <=> query_embedding
    LIMIT match_count;
  END;
  $$;
`;

async function run() {
    console.log("Executing schema setup via Supabase REST...");
    const { data, error } = await supabase.rpc('setup_schema', { query: sql });

    // Fallback if rpc 'setup_schema' doesn't exist (since Supabase client doesn't 
    // natively support raw SQL execution without a proxy function in plpgsql)
    if (error) {
        console.error("RPC failed, returning instructions to user:", error.message);
    } else {
        console.log("Success:", data);
    }
}

run();
