-- Källström-berikning (batch): lokalristare Ärnfast, Balle, Brune, Gudfast, Livsten,
-- Sune, Torsten, Visäte + kvinnliga ristaren Gunnborga (Hs 21). Attribut (härkomst/
-- släktskap/övrigt). Applicerad via MCP; denna fil för repro.
update public.carvers c set
  region = v.region, gender = v.gender, is_professional = v.prof, description = v.descr,
  source_ref = coalesce(v.src, 'Källström, M. (2007). Mästare och minnesmärken, Runrön 18 (DiVA).')
from (values
  ('0d4390a7-c962-4ba7-af3c-22b7764709e0','Uppland','male',false,'Ärnfast — ristare verksam på Mälaröarna. Signerad på den försvunna U 123 Karlberg (Solna sn, tillsammans med Sigfast, trolig släkting) samt U 41, U 43 och U 79; ytterligare stenar tillskrivs honom. Alla säkert signerade stenar tillhör Pr 3 (ca 1050–1080). Crocker menar att han kan ha varit en efterföljare eller medhjälpare till Fot.',null),
  ('473cf687-cd94-4128-b195-21d01e747854','Uppland','male',true,'Balle — en av de mest produktiva uppländska runristarna, särskilt aktiv i Fjädrundaland (Stille 1999b), Pr 4 tillsammans med Åsmund och Öpir. Enligt U 1161 var Balle och Frösten Livstens följeslagare (liþ). Att skilja från den västmanländske Röd-Balle.','Philippa (1977); Källström, M. (2007). Mästare och minnesmärken, Runrön 18 (DiVA).'),
  ('1afb96ea-0417-4fa9-bd00-9bbcbc6c87bb','Södermanland','male',false,'Brune — känd från Sö 178 Gripsholm (Kärnbo sn), där han enligt signaturen var bror till den kvinna som stenen tillägnats; möjligen även Sö 177. Att skilja från en namnlik Brune på Sö 55 Bjudby.',null),
  ('b0c0c7b3-dacf-4a2c-b064-f48d3f844e1c','Uppland','male',false,'Gudfast — signerad på U 918 Blacksta (Jumkils sn), ristad efter hans son Kättilmund. Verksam inom ett begränsat område kring Jumkil. v. Friesen menade att han utgick från Öpir.',null),
  ('e27ee1ba-4893-4b04-8dd4-9418df15dcd8','Uppland','male',true,'Livsten — uppländsk ristare i Fjädrundaland; signerad bl.a. U 1161 Altuna, U 1158, U 1152. Enligt U 1161 hade han följeslagare (Balle och Frösten). Studerad av Stille (1992b).','Stille (1992b); Källström, M. (2007). Mästare och minnesmärken, Runrön 18 (DiVA).'),
  ('cbd83576-b50b-4972-9fac-2c9c89fbda51','Uppland','male',false,'Sune — lokalt verksam uppländsk ristare med endast ett fåtal kända stenar.',null),
  ('42b83866-bd02-433e-8ec3-d200638fdd72','Uppland','male',false,'Torsten — välbeställd storbonde-ristare som förvärvat rikedomar utomlands och köpt ytterligare en gård; ristningarna sprider sig kring hans två gårdar. Två stenar har påträffats efter UR, en så sent som 2002.',null),
  ('a98282ae-4abb-41fc-b299-d8db8b9a01f3','Uppland','male',true,'Visäte — produktiv uppländsk ristare; signerad bl.a. U 454 (Víseti rísti) och U 669 (med Ofeg). Studerad av Källström (1992) och D. Nilsson (2001).','Källström (1992); D. Nilsson (2001); Källström, M. (2007). Mästare och minnesmärken, Runrön 18 (DiVA).'),
  ('74295e22-eaa0-4537-913b-0f14f0a83140','Hälsingland','female',false,'Gunnborga — den enda någorlunda säkert belagda kvinnliga runristaren från vikingatiden. Signerad på Hs 21 Jättendals kyrka: Gunnborga fáði stæin þenna (hin(n) góða). Källström anser stenen rimligtvis ristad av kvinnan i ristarformeln.',null)
) as v(id, region, gender, prof, descr, src)
where c.id = v.id::uuid;

insert into public.carver_attributes (carver_id, attribute_type, value_sv, value_en, source_ref)
select v.cid::uuid, v.atype, v.vsv, v.ven, 'Källström, M. (2007). Mästare och minnesmärken, Runrön 18 (DiVA).'
from (values
  ('0d4390a7-c962-4ba7-af3c-22b7764709e0','origin','Karlberg, Solna socken','Karlberg, Solna parish'),
  ('b0c0c7b3-dacf-4a2c-b064-f48d3f844e1c','origin','Jumkils socken','Jumkil parish'),
  ('1afb96ea-0417-4fa9-bd00-9bbcbc6c87bb','kinship','bror till den kvinna som Sö 178 tillägnats','brother of the woman commemorated on Sö 178'),
  ('74295e22-eaa0-4537-913b-0f14f0a83140','other','hin góða — den goda (osäkert om epitetet syftar på henne eller stenen)','hin góða — the good (uncertain whether the epithet refers to her or the stone)')
) as v(cid, atype, vsv, ven)
where not exists (select 1 from public.carver_attributes ca where ca.carver_id=v.cid::uuid and ca.attribute_type=v.atype and ca.value_sv=v.vsv);
