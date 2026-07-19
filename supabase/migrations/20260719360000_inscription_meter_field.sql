-- ============================================================================
-- Versform (meter) på runinskrifter + metrisk not på Rökstenen.
--
-- Motiv: den skarpaste skillnaden mellan skalder och hantverksristare är
-- textuell/metrisk — skaldisk dróttkvätt vs eddisk fornyrðislag vs formelprosa.
-- Ett `meter`-fält gör den distinktionen sökbar. Karlevi (Öl 1) faller ut som
-- skaldisk (dróttkvätt), Rök (Ög 136) som eddisk (fornyrðislag).
--
-- Röks eddiska metrik är dessutom ett metriskt argument MOT en skaldattribution
-- (t.ex. Brage Boddason, vars Ragnarsdrápa är dróttkvätt) — noten nedan
-- dokumenterar detta bredvid den befintliga Ousbäck-hypotesen.
-- ============================================================================

begin;

alter table public.runic_inscriptions add column if not exists meter text;

comment on column public.runic_inscriptions.meter is
  'Versform/metrik. Skaldiskt: dróttkvätt (m.fl. hovmetrik). Eddiskt: fornyrðislag, ljóðaháttr, málaháttr, kviðuháttr. Annat: prosa, blandad. NULL = ej bestämd/ej diktad.';

-- Rök (Ög 136): eddisk hjältemetrik (blandad med prosa). Sätt meter + appendera metrisk not.
update public.runic_inscriptions
set meter = 'fornyrðislag',
    scholarly_notes = coalesce(scholarly_notes, '') || E'\n\nMetrisk not: Röks versparti (bl.a. Tjodrik-strofen »Réð Þjóðríkr hinn þurmóði …«) är fornyrðislag — eddisk/hjältemetrik, blandad med prosa — inte skaldiskt dróttkvätt. Det talar snarast EMOT en skaldattribution (som Brage Boddason, vars Ragnarsdrápa är dróttkvätt) och FÖR en diktare i þulr-/traditionsdiktningens register. Det som ändå kan stödja en Bragi-koppling är inte metriken utan innehållet (den gotiska hjältecykeln: Þjóðríkr/Teoderik jfr Ragnarsdrápas Jörmunrekk och Hamðir–Sörli), kronologin (~800-tal) och miljön (jfr Ousbäck-hypotesen om Björn på Birka). Hypotesen är omdiskuterad och vilar på stoff och miljö, inte på versmåttet.'
where id = '0be64520-b663-4e19-aa3e-bb0c9ffbb8ba';   -- Ög 136 Rök

-- Karlevi (Öl 1): den enda fullständiga dróttkvätt-strofen på en runsten — entydigt skaldiskt.
update public.runic_inscriptions
set meter = 'dróttkvätt'
where id = 'ddbb1147-014c-4efb-a621-01a1b1b8f561';   -- Öl 1 Karlevi

commit;
