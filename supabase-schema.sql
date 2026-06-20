-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- 1. Create the logs table
create table if not exists public.logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  service text not null,
  level text not null,
  message text not null,
  meta jsonb
);

-- 2. Create the meetings table
create table if not exists public.meetings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  meeting_id text unique not null,
  title text,
  video_url text,
  audio_url text,
  department text,
  summary text,
  contradictions text[],
  started_at timestamp with time zone,
  transcript_text text,
  agenda text,
  agenda_label text,
  agenda_score integer,
  agenda_met boolean,
  outcome_score integer,
  outcome_met boolean
);

-- 3. Create the decisions table
create table if not exists public.decisions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  meeting_id text not null,
  speaker text not null,
  content text not null,
  department text not null
);

-- 4. Create the meeting_chunks table for RAG embeddings
create table if not exists public.meeting_chunks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  meeting_id text not null,
  content text not null,
  embedding vector(1536),
  department text not null
);

-- 5. Create the RAG matching function (drop first to allow signature change)
drop function if exists match_meeting_chunks(vector, double precision, integer, text);

create or replace function match_meeting_chunks (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_dept text
)
returns table (
  id uuid,
  meeting_id text,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    mc.id,
    mc.meeting_id,
    mc.content,
    1 - (mc.embedding <=> query_embedding) as similarity
  from meeting_chunks mc
  where mc.department = filter_dept
    and 1 - (mc.embedding <=> query_embedding) > match_threshold
  order by mc.embedding <=> query_embedding
  limit match_count;
end;
$$;
