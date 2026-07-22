-- Berikning av den neolitiska pest-händelsen med skandinavisk nyckelforskning.
-- Applicerad via MCP execute_sql; fil = proveniens. Seersholm et al. 2024 (Nature 632:114):
-- pest hos 17% av 108 neolitiska skandinaver i Falbygdens megaliter (Frälsegården/Gökhem),
-- tre smittvågor på ~120 år, kopplat till neolitiska nedgången ~5300–4900 f.n.; patrilinjärt
-- samhälle m. kvinnlig exogami. Ankomst debatterad: Yamnaya-migration ~4800 f.n.
-- (Andrades Valtueña 2017, Curr Biol) vs tidiga basala linjer (Rascovan 2019, Cell).
-- Samma plats (Gökhem) som den omdaterade vikingatida hunden.
update public.historical_events set
  event_name='Neolitisk pest & neolitiska nedgången (Falbygden/Gökhem)',
  event_name_en='Neolithic plague & the Neolithic decline (Falbygden/Gökhem)',
  year_start=-3300, year_end=-2900, significance_level='very_high',
  description='Bland de äldsta pest-beläggen (Yersinia pestis). Seersholm et al. 2024 fann pest hos 17% av 108 neolitiska skandinaver i Falbygdens megalitgravar (bl.a. Frälsegården, Gökhem) — tre smittvågor under ~120 år. Sammanfaller med neolitiska nedgången (~5300–4900 f.n.). Ankomst debatteras: Yamnaya-migration ~4800 f.n. (Andrades Valtueña 2017) vs tidiga basala linjer (Rascovan 2019). Stammarna saknade ymt-genen → ej loppburen böldpest. Patrilinjärt samhälle m. kvinnlig exogami.',
  description_en='Among the oldest plague evidence. Seersholm et al. 2024: plague in 17% of 108 Neolithic Scandinavians in the Falbygden megaliths, three waves over ~120 years, coinciding with the Neolithic decline. Strains lacked ymt → not flea-borne bubonic.',
  sources=array['Seersholm et al. 2024, Nature 632:114','Andrades Valtueña et al. 2017, Current Biology 27:3683','Rascovan et al. 2019, Cell 176:295']
where event_name='Neolitisk pest (Gökhem)';
