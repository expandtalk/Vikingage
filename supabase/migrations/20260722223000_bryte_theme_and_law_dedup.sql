-- Bryte/förvaltnings-tema + dedup av landskapslagar
-- Daniel 2026-07-22: gruppera ihop de fem bryte/förvaltar-stenarna (U 11, Sö 42,
-- DR 40, DR 107, DR 134) som epigrafiska vittnen till samma förvaltningsinstitution.
-- Tre-bo-strukturen i Östgötalagen (konungs/jarls/biskops bryti) mappar på maktgeografins
-- tre fiscal_system (krondomän/ledung/tionde). Källkritik: institutionen sannolikt äldre
-- (folkvandringstida gods), men titel + skatteapparat belagda först ~1000; lagen (~1290)
-- är yngsta vittnet, ej äldsta — deep continuity taggas som hypotes, ej faktum.

-- 1) Rensa dubbletter av landskapslagar (två Östgötalagen, två Äldre Västgötalagen).
--    Behåll raden med referenser + fyllig metadata; berika den; radera den barnlösa.
UPDATE historical_sources
   SET written_year = 1290, work_type = 'landskapslag',
       bias_types = '{political_legitimacy,christian_anti_pagan}'
 WHERE id = '50bc0d56-29c8-431c-93f3-154761938c36';   -- Östgötalagen (keeper)

UPDATE historical_sources
   SET bias_types = '{political_legitimacy,christian_anti_pagan}'
 WHERE id = '65c956ed-d1b0-4712-912f-11dc13ea3736';   -- Äldre Västgötalagen (keeper)

DELETE FROM historical_sources
 WHERE id IN (
   '1999ca45-42cf-453b-adb8-f78213073f29',  -- dubblett Östgötalagen (0 referenser)
   '8fa92207-15a1-4a79-8ad8-c9d083440f04'   -- dubblett Äldre Västgötalagen (0 referenser)
 );

-- 2) Tema + länkar (theme_links är write-through-vy över relationship; INSTEAD OF-trigger).
DO $$
DECLARE tid uuid;
BEGIN
  SELECT id INTO tid FROM themes WHERE slug = 'bryte-forvaltningsorganisation';
  IF tid IS NULL THEN
    INSERT INTO themes(slug, name, name_en, description, description_en, keywords, icon)
    VALUES(
      'bryte-forvaltningsorganisation',
      'Bryte och förvaltningsorganisation',
      'The bryti and estate administration',
      'Bryten (fornnord. bryti) var en förvaltare som skötte en gård eller ett gods åt en frånvarande ägare — kung, jarl, storman eller biskop. Fem runstenar (U 11, Sö 42, DR 40, DR 107, DR 134) vittnar om institutionen på 1000-talet, med lokalt varierande titlar (bryti, landdrótt, landhirðir) men samma funktion. Östgötalagen (ca 1290) formaliserar en tredelad ordning: konungs bryti i Uppsala bo (krondomän), jarls bryti i Rodz bo (Roden/ledung) och biskops bryti i staf ok stols bo (biskopsbordet/tionde) — vilket speglar de tre konkurrerande skattesystemen i maktgeografin. Institutionen är sannolikt äldre (folkvandringstida stormannagods hade förvaltare), men titeln och skatteapparaten är belagda först från vikingatidens slut. U 11 vid Hovgården på Adelsö är den enda bevarade primärkällan till jarls bryti i Rodz bo — själva ledungsledet.',
      'The bryti was a steward managing an estate for an absent owner — king, jarl, magnate or bishop. Five runestones (U 11, Sö 42, DR 40, DR 107, DR 134) attest the institution in the 11th century, with locally varying titles (bryti, landdrótt, landhirðir) but the same function. The Law of Östergötland (c. 1290) formalises a threefold order — the king''s bryti in Uppsala bo (crown demesne), the jarl''s in Rodz bo (Roden/leidang), the bishop''s in staff-and-see estate (tithe) — mirroring the three competing fiscal systems. The institution is likely older, but the title and fiscal apparatus are documented only from the late Viking Age.',
      ARRAY['bryte','bryti','roden','ledung','uppsala öd','förvaltning','fogde','landdrótt','landhirðir'],
      '⚖️')
    RETURNING id INTO tid;
  END IF;

  -- idempotent: rensa ev. tidigare länkar till detta tema
  DELETE FROM relationship WHERE predicate = 'has_theme' AND object_id = tid;

  INSERT INTO theme_links(theme_id, entity_type, entity_id, notes) VALUES
    (tid,'inscription','de493999-520d-401f-8651-9955dabb7ed1','U 11 Hovgården/Håkanstenen (ca 1065) — kungens bryti "i roþ" (Roden). Enda primärkällan till jarls bryti i Rodz bo = ledungsledet.'),
    (tid,'inscription','83c27fb0-bcfe-448f-ade5-330852cfe431','Sö 42 Västerljung — en stormans bryte (brutia sin); Sigvalde reste stenen efter sin förvaltare.'),
    (tid,'inscription','214b3db5-7332-4e5f-a441-71314129a7f1','DR 40 Randbøl (Jylland) — Tófi bryti reste stenen efter brytens hustru (brutia).'),
    (tid,'inscription','6b572819-4e60-4ed0-b0d1-a5c251286dc5','DR 107 Egå (Jylland) — Manni var Ketill den norskes godsförvaltare (landdrótt): samma funktion, annan titel.'),
    (tid,'inscription','c1e1b00a-ed65-4167-a711-02dad1249bb1','DR 134 Ravnkilde (Jylland) — Ǫzurr landförvaltare (landhirðir); regional titelvariant.'),
    (tid,'source','50bc0d56-29c8-431c-93f3-154761938c36','Östgötalagen (ca 1290): "konungs bryti i Uppsala bo, jarls bryti i Rodz bo, biskops bryti i staf ok stols bo" — tre-bo-strukturen. Yngsta vittnet; kodifierar äldre sedvänja 225 år efter U 11.');
END $$;
