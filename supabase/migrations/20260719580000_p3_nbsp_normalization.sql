-- P3-uppföljning: normalisera NBSP (U+00A0) → vanligt mellanslag.
-- MySQL-dumpen bär NBSP i bl.a. Gräslund-stilkoder ('Pr 4' är P,r,NBSP,4) —
-- osynligt i UI men bryter all textmatchning/sök/facetter.
-- Strategi (PK/FK-säker): 1) lägg in normaliserade vocabulary-rader,
-- 2) peka om länktabellernas koder, 3) radera NBSP-raderna, 4) städa skalärer.
-- Rått staging (rundata_raw) rörs INTE — normalisering sker vid integrationsgränsen.

begin;

-- 1. normaliserade dubbletter av alla NBSP-koder
insert into public.vocabulary (scheme, code, label_sv, label_en, parent_code, category,
                               period_start, period_end, source_uuid, source_ref, wikidata_id, description)
select scheme,
       replace(code, chr(160), ' '),
       replace(label_sv, chr(160), ' '),
       replace(label_en, chr(160), ' '),
       replace(parent_code, chr(160), ' '),
       category, period_start, period_end, source_uuid, source_ref, wikidata_id, description
from public.vocabulary
where code like '%' || chr(160) || '%'
   or coalesce(parent_code, '') like '%' || chr(160) || '%'
on conflict (scheme, code) do nothing;

-- även parent_code på rader vars kod är ren men förälder har NBSP
update public.vocabulary set parent_code = replace(parent_code, chr(160), ' ')
where coalesce(parent_code, '') like '%' || chr(160) || '%'
  and code not like '%' || chr(160) || '%';

-- 2. peka om länktabellerna
update public.inscription_style set style_code = replace(style_code, chr(160), ' ')
where style_code like '%' || chr(160) || '%';
update public.inscription_material set material_code = replace(material_code, chr(160), ' ')
where material_code like '%' || chr(160) || '%';
update public.inscription_runetype set runetype_code = replace(runetype_code, chr(160), ' ')
where runetype_code like '%' || chr(160) || '%';

-- 3. radera NBSP-raderna ur vokabulären
delete from public.vocabulary where code like '%' || chr(160) || '%';

-- 4. städa deriverade skalärer + andra kända NBSP-bärare på inskriften
update public.runic_inscriptions set style_group = replace(style_group, chr(160), ' ')
where style_group like '%' || chr(160) || '%';
update public.runic_inscriptions set material = replace(material, chr(160), ' ')
where material like '%' || chr(160) || '%';

commit;
