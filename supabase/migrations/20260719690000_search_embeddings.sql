-- P4-uppföljning: semantiska benet. Embeddings via Supabases inbyggda gte-small
-- (384 dim, engelskfokuserad men fungerande för nordiska texter — noll API-kostnad,
-- ingen nyckel; dokumenterad begränsning). Fylls av edge-funktionen embed-search.
-- match_search_docs = vektor-benet som edge-sökvägen (K2) anropar.
begin;

alter table public.search_document add column if not exists embedding vector(384);
alter table public.search_document add column if not exists embedding_model text;

create index if not exists sd_embedding_hnsw on public.search_document
  using hnsw (embedding vector_cosine_ops);

create or replace function public.match_search_docs(query_embedding vector(384), match_count int default 20)
returns table (entity_type text, entity_id uuid, similarity double precision)
language sql stable as $$
  select d.entity_type, d.entity_id, 1 - (d.embedding <=> query_embedding) as similarity
  from public.search_document d
  where d.embedding is not null
  order by d.embedding <=> query_embedding
  limit match_count;
$$;

commit;
