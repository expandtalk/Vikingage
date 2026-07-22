-- Fas A / A2: inför 'editor'-roll (forskare/granskare) i app_role.
-- Applicerad via MCP mot fjärr-DB (db push trasig i detta repo) — denna fil är proveniens.
-- Egen migration: ALTER TYPE ADD VALUE ska inte samsas med användning av värdet i samma transaktion.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'editor';
