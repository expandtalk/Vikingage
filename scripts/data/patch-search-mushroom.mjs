// Gör svamparna sökbara: injicerar ett 'mushroom'-block i rebuild_search_document_x (samma
// md5-uuid-mönster som saint/content_page — svamp.art har text-id), utökar search_thumbs med
// svampbilder, och populerar. Idempotent. Kör: node scripts/data/patch-search-mushroom.mjs
// Bakgrund: "kantarell" gav 0 träffar — svamp låg inte i search_document. Jfr search-index-architecture.
import fs from 'fs'; import pg from 'pg';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()];}));
const c = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await c.connect();

// 1) mushroom-block i rebuild_search_document_x (före 'end $function$')
let def = (await c.query(`select pg_get_functiondef(oid) d from pg_proc where proname='rebuild_search_document_x'`)).rows[0].d;
const block = `
  if p_type is null or p_type = 'mushroom' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv, body_en)
    select 'mushroom', md5('mushroom:'||a.id)::uuid, a.svenskt_namn,
      concat_ws(' · ', 'ätlig matsvamp', nullif(a.vetenskapligt_namn,'')),
      concat_ws(' ', a.vetenskapligt_namn, a.kannetecken, 'svamp matsvamp ätlig plocka'),
      coalesce(a.vetenskapligt_namn,'')
    from svamp.art a where (p_id is null or md5('mushroom:'||a.id)::uuid = p_id);
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv, body_en)
    select 'mushroom', md5('mushroom:'||g.id)::uuid, g.svenskt_namn,
      concat_ws(' · ', 'giftig förväxlingssvamp', nullif(g.vetenskapligt_namn,''), 'allvarlighet '||g.allvarlighet||'/5'),
      concat_ws(' ', g.vetenskapligt_namn, g.toxin, g.kanne_pa, g.symtom, 'svamp giftsvamp giftig förväxling'),
      coalesce(g.vetenskapligt_namn,'')
    from svamp.giftsvamp g where (p_id is null or md5('mushroom:'||g.id)::uuid = p_id);
  end if;
`;
if (def.includes("p_type = 'mushroom'")) console.log('mushroom-block finns redan');
else { await c.query(def.replace(/end\s*\$function\$\s*$/, block + '\nend $function$\n')); console.log('mushroom-block injicerat'); }
await c.query(`alter function public.rebuild_search_document_x(text, uuid) set search_path to 'public','svamp'`);

// 2) search_thumbs + svampbilder (DISTINCT ON-selecten måste parentesomslutas före UNION)
await c.query(`create or replace function public.search_thumbs(p_ids uuid[])
 returns table(entity_id uuid, thumb_url text) language sql stable security definer set search_path to 'public','svamp'
as $f$
  ( select distinct on (m.inscription_id) m.inscription_id, m.media_url
    from inscription_media m
    where m.inscription_id = any(p_ids) and m.media_url is not null and m.media_url <> ''
      and coalesce(m.media_type,'image') not in ('video','3d','model')
    order by m.inscription_id,
      (m.media_url ~* '\\.(jpe?g|png|webp|gif)(\\?|$)' or m.media_url ilike '%wikimedia%') desc, m.created_at asc nulls last )
  union all
  select md5('mushroom:'||a.id)::uuid, a.bild_url from svamp.art a where a.bild_url is not null and md5('mushroom:'||a.id)::uuid = any(p_ids)
  union all
  select md5('mushroom:'||g.id)::uuid, g.bild_url from svamp.giftsvamp g where g.bild_url is not null and md5('mushroom:'||g.id)::uuid = any(p_ids);
$f$`);

// 3) populera + verifiera
await c.query(`select rebuild_search_document('mushroom')`);
console.log('mushroom-rader i search_document:', (await c.query(`select count(*) n from search_document where entity_type='mushroom'`)).rows[0].n);
await c.end();
