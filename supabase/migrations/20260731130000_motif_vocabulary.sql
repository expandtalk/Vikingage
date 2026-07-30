-- Kontrollerad motiv-vokabulär + konsekvent omkodning. Löser "inkonsekvent kodning"-kritiken:
-- motif_attestation.(motif_cycle,motif_key) tvingas nu via FK att finnas i motif_vocabulary,
-- så samma sak alltid får samma nyckel → klustring/överlappning mäter något verkligt.
-- Alla motiv per sten är källverifierade (Sigurd stones, Wikipedia + foto där angivet).
-- Applicerad via pooler; fil = proveniens.

CREATE TABLE IF NOT EXISTS public.motif_vocabulary (
  motif_cycle text NOT NULL,
  motif_key   text NOT NULL,
  label_sv    text NOT NULL,
  label_en    text NOT NULL,
  description text,
  source      text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (motif_cycle, motif_key)
);
ALTER TABLE public.motif_vocabulary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS motif_vocab_read ON public.motif_vocabulary;
CREATE POLICY motif_vocab_read ON public.motif_vocabulary FOR SELECT USING (true);
DROP POLICY IF EXISTS motif_vocab_write ON public.motif_vocabulary;
CREATE POLICY motif_vocab_write ON public.motif_vocabulary FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
GRANT SELECT ON public.motif_vocabulary TO anon, authenticated;

INSERT INTO public.motif_vocabulary (motif_cycle, motif_key, label_sv, label_en, description) VALUES
  ('sigurd','sigurd_stabs_dragon','Sigurd stinger draken Fafnir','Sigurd thrusts his sword into Fáfnir','Sigurd sticker svärdet i draken, ofta underifrån.'),
  ('sigurd','dragon_as_runeband','Draken som runband','The dragon forms the rune-band','Fafnir återges som det runbärande bandet.'),
  ('sigurd','roasting_heart','Fafnirs hjärta steks','Fáfnir''s heart roasting on a spit','Hjärtat steks på spett.'),
  ('sigurd','thumb_sucking','Sigurd suger på tummen','Sigurd sucking his burned thumb','Bränd på hjärtat → smakar på blodet.'),
  ('sigurd','talking_birds','De talande fåglarna','The talking birds','Fåglarna vars tal Sigurd förstår.'),
  ('sigurd','regin_beheaded','Den halshuggne Regin','Regin beheaded','Smeden Regin död/halshuggen.'),
  ('sigurd','smiths_tools','Smedens verktyg','The smith''s tools','Tång, hammare, städ, bälg.'),
  ('sigurd','grani','Hästen Grane','Grani the horse','Sigurds häst, ofta lastad med skatten.'),
  ('sigurd','otr','Ótr','Ótr','Regins och Fafnirs broder (uttern).'),
  ('sigurd','andvari_ring','Andvari/dvärg med ringen','Andvari/dwarf with the ring','Ringen Andvaranaut.'),
  ('sigurd','sigrdrifa_horn','Sigrdriva räcker dryckeshorn','Sigrdrífa offering a drinking horn','Valkyrian bjuder Sigurd horn.'),
  ('sigurd','tree','Trädet','The tree','Trädet med fåglar / där Grane är bunden.'),
  ('sigurd','sigurd_figure','Sigurd (figur)','Sigurd as a figure','Sigurd avbildad utan specifik scen.'),
  ('gunnar','gunnar_snakepit','Gunnar i ormgropen','Gunnar in the snake pit','Gunnar Gjukesson kastad i ormgropen.'),
  ('gunnar','gunnar_harp','Gunnar spelar harpa','Gunnar playing the harp','Spelar harpa (ofta med fötterna).'),
  ('thors_fiske','thor_with_mjolnir','Tor med Mjölner','Thor with the hammer Mjölnir','Tor håller hammaren.'),
  ('thors_fiske','foot_through_boat','Tors fot genom båtbottnen','Thor''s foot through the boat hull','Foten spränger båtbotten när ormen nappar.'),
  ('thors_fiske','ox_head_bait','Oxhuvud som bete','Ox-head as bait','Hymers oxhuvud som bete.'),
  ('thors_fiske','midgard_serpent','Midgårdsormen','The Midgard Serpent','Jörmungandr.'),
  ('board_game','hnefatafl','Två män spelar hnefatafl','Two men playing hnefatafl','Brädspelsscen.')
ON CONFLICT DO NOTHING;

-- Rensa den första (inkonsekventa) seeden och tvinga controlled-vocabulary via FK.
DELETE FROM public.motif_attestation;
ALTER TABLE public.motif_attestation DROP CONSTRAINT IF EXISTS motif_att_vocab_fk;
ALTER TABLE public.motif_attestation
  ADD CONSTRAINT motif_att_vocab_fk FOREIGN KEY (motif_cycle, motif_key)
  REFERENCES public.motif_vocabulary(motif_cycle, motif_key);

-- Konsekvent omkodning + nya stenar (alla källverifierade). Labels bor nu i vokabulären.
INSERT INTO public.motif_attestation (inscription_id, motif_cycle, motif_key, confidence, is_hypothesis, interpreter, source)
SELECT ri.id, x.cyc, x.key, x.conf, x.hyp, 'Standardrunologi (UR/Rundata)', x.src
FROM (VALUES
  -- Ramsund Sö 101 (foto + Sigurd stones)
  ('Sö 101','sigurd','sigurd_stabs_dragon','certain',false,'Sigurd stones (Wikipedia); foto Ramsundsberget'),
  ('Sö 101','sigurd','dragon_as_runeband','certain',false,'foto Ramsundsberget'),
  ('Sö 101','sigurd','roasting_heart','certain',false,'Sigurd stones (Wikipedia)'),
  ('Sö 101','sigurd','thumb_sucking','certain',false,'Sigurd stones (Wikipedia)'),
  ('Sö 101','sigurd','talking_birds','certain',false,'foto + Sigurd stones (Wikipedia)'),
  ('Sö 101','sigurd','regin_beheaded','certain',false,'foto + Sigurd stones (Wikipedia)'),
  ('Sö 101','sigurd','smiths_tools','certain',false,'foto Ramsund'),
  ('Sö 101','sigurd','grani','certain',false,'Sigurd stones (Wikipedia)'),
  ('Sö 101','sigurd','otr','certain',false,'Sigurd stones (Wikipedia)'),
  -- Gök Sö 327
  ('Sö 327','sigurd','sigurd_stabs_dragon','certain',false,'Sigurd stones (Wikipedia): Gök'),
  ('Sö 327','sigurd','tree','certain',false,'Sigurd stones (Wikipedia): Gök'),
  ('Sö 327','sigurd','grani','certain',false,'Sigurd stones (Wikipedia): Gök'),
  ('Sö 327','sigurd','talking_birds','certain',false,'Sigurd stones (Wikipedia): Gök'),
  ('Sö 327','sigurd','regin_beheaded','certain',false,'Sigurd stones (Wikipedia): Gök'),
  ('Sö 327','sigurd','roasting_heart','certain',false,'Sigurd stones (Wikipedia): Gök'),
  ('Sö 327','sigurd','otr','probable',false,'Sigurd stones (Wikipedia): Gök'),
  -- Drävle U 1163
  ('U 1163','sigurd','sigurd_stabs_dragon','certain',false,'Sigurd stones (Wikipedia): Drävle'),
  ('U 1163','sigurd','dragon_as_runeband','certain',false,'Sigurd stones (Wikipedia): Drävle'),
  ('U 1163','sigurd','sigrdrifa_horn','certain',false,'Sigurd stones (Wikipedia): Drävle'),
  ('U 1163','sigurd','andvari_ring','probable',false,'Sigurd stones (Wikipedia): Drävle'),
  -- Stora Ramsjö U 1175 ("samma motiv som U 1163", meningslösa runor)
  ('U 1175','sigurd','sigurd_stabs_dragon','probable',false,'Sigurd stones (Wikipedia): Stora Ramsjö (= U 1163)'),
  ('U 1175','sigurd','dragon_as_runeband','probable',false,'Sigurd stones (Wikipedia): Stora Ramsjö'),
  ('U 1175','sigurd','sigrdrifa_horn','probable',false,'Sigurd stones (Wikipedia): Stora Ramsjö'),
  ('U 1175','sigurd','andvari_ring','probable',false,'Sigurd stones (Wikipedia): Stora Ramsjö'),
  -- Österfärnebo Gs 2 (rekonstruerad ur 1690-teckning → hypotes)
  ('Gs 2','sigurd','talking_birds','possible',true,'Sigurd stones (Wikipedia): Gs 2, rekonstr. 1690-teckning'),
  ('Gs 2','sigurd','otr','probable',true,'Sigurd stones (Wikipedia): Gs 2'),
  ('Gs 2','sigurd','andvari_ring','probable',true,'Sigurd stones (Wikipedia): Gs 2'),
  ('Gs 2','sigurd','grani','possible',true,'Sigurd stones (Wikipedia): Gs 2'),
  -- Årsunda Gs 9 (ristare Balle)
  ('Gs 9','sigurd','sigurd_figure','probable',false,'Sigurd stones (Wikipedia): Årsunda'),
  ('Gs 9','sigurd','andvari_ring','probable',false,'Sigurd stones (Wikipedia): Årsunda'),
  -- Ockelbo Gs 19
  ('Gs 19','sigurd','sigurd_figure','probable',false,'Sigurd stones (Wikipedia): Ockelbo'),
  ('Gs 19','board_game','hnefatafl','certain',false,'Sigurd stones (Wikipedia): Ockelbo'),
  -- Västerljung Sö 40 (Gunnar-cykeln)
  ('Sö 40','gunnar','gunnar_snakepit','certain',false,'Sigurd stones (Wikipedia): Västerljung'),
  ('Sö 40','gunnar','gunnar_harp','certain',false,'Sigurd stones (Wikipedia): Västerljung'),
  -- Altuna U 1161 (Tors fiske; foto + Altuna Runestone)
  ('U 1161','thors_fiske','thor_with_mjolnir','probable',false,'Altuna Runestone (Wikipedia); foto'),
  ('U 1161','thors_fiske','foot_through_boat','certain',false,'Altuna Runestone (Wikipedia); foto'),
  ('U 1161','thors_fiske','ox_head_bait','certain',false,'Altuna Runestone (Wikipedia)'),
  ('U 1161','thors_fiske','midgard_serpent','certain',false,'Altuna Runestone (Wikipedia)')
) AS x(signum, cyc, key, conf, hyp, src)
JOIN public.runic_inscriptions ri ON ri.signum = x.signum;
