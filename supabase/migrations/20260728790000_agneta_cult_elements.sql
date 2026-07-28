-- Agnetas fulla klusterordlista in i ledkatalogen (hennes gradering + tolkningar, attribuerat).
-- include=true → ledparsern räknar dem i Ångermanland-analysen. OBS: flera är homonymer med
-- topografiska ord (val/vall, ed, var, hel, get, mor) → heuristisk regex, FALSKA TRÄFFAR möjliga;
-- resultatet är PRELIMINÄRT och hit-listan ska verifieras av forskaren. owner='Agneta'.
insert into public.ortnamn_element_config (element_key,label,category,strength,include,forms,owner,note) values
 ('val','Val/Vala (völvan)','sacral','strong',true,'val-, vala- (ofta dold under vall/valla)','Agneta','Völvan? Ofta dold under vall/valla — svår att skilja från vall (topografi). Agnetas kluster.'),
 ('ed','Ed (edsavläggelse)','power','strong',true,'eds-: Edsele, Edsta','Agneta','Platser för edsavläggelse? Homonym med ed "näs/land mellan vatten" — verifiera.'),
 ('hammar','Hammar (ting)','power','strong',true,'hammar-: Hammar, Hammarby','Agneta','Forntida ting? Agnetas kluster.'),
 ('horn','Horn (hornet/valan)','sacral','strong',true,'horn-','Agneta','Det skallande hornet? Valan? Agnetas kluster.'),
 ('mor','Mor/Mora (stora modern)','sacral','strong',true,'mor-, mora-','Agneta','Den stora modern. Homonym med mo/mor "mark" — verifiera.'),
 ('lund','Lund (helig lund)','sacral','weak',true,'-lund (oftast efterled): Äspelund','Agneta','Helig lund. OBS oftast EFTERLED → förled-parsern fångar bara Lund-/Lundby.'),
 ('tuna','Tuna (centralplats)','power','weak',true,'tuna: Tuna, Vallentuna','Agneta','Central-/kultplats. Ofta efterled (-tuna).'),
 ('var','Vár (edernas gudinna)','sacral','weak',true,'var-','Agneta','Vár, gudinnan för ederna. HÖG falsk-träff-risk (var/vara vanligt) — verifiera.'),
 ('skade','Skade (vintergudinnan)','sacral','weak',true,'skade-','Agneta','Skade, vinterns gudinna. Agnetas kluster.'),
 ('hel','Hel (dödsrikets moder)','sacral','weak',true,'hel-','Agneta','Hel, modersgudinnan i dödsriket. Homonym med helig/häl — verifiera.'),
 ('oden','Oden','sacral','weak',true,'oden-, odin-: Odensvi, Odensala','Agneta','Oden. Odensvi/Odensala erkända sakralnamn.'),
 ('galt','Galt (Frejs galt?)','sacral','weak',true,'galt-','Agneta','Galten — fruktbarhet (Frej?). Agnetas kluster.'),
 ('get','Get','sacral','weak',true,'get-','Agneta','Get. Homonym med get "tamdjur" — verifiera.'),
 ('gås','Gås','sacral','weak',true,'gås-','Agneta','Gås. Agnetas kluster.')
on conflict (element_key) do update set label=excluded.label, category=excluded.category,
  strength=excluded.strength, include=excluded.include, forms=excluded.forms, owner=excluded.owner, note=excluded.note;
