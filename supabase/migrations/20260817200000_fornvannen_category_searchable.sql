-- STEG 1: gör Fornvännen-kategorierna sökbara. Idag ger search_v1('runologi') 0 artiklar —
-- kategori-slugen ligger inte i artiklarnas sök-body (bara ämnen som "Runstenar" finns där).
-- Väv in läsbara kategori-ord i body_sv (tsv_sv är generated från label+body_sv → regenereras).
-- Källkritik: kategorin är HÄRLEDD vid harvest (av DiVA-metadata), sök-signal — ej auktoritativ klassning.
-- Idempotent: markören '[kat:' hindrar dubbel-invävning vid omkörning.

update public.search_document sd
set body_sv = sd.body_sv || ' [kat:' || hs.category || '] ' ||
  case hs.category
    when 'arkeologi'            then 'arkeologi'
    when 'kyrka_konst'          then 'kyrka konst kyrkokonst kyrklig konst kalkmåleri'
    when 'järnålder_vikingatid' then 'järnålder vikingatid vikingatida'
    when 'runologi'             then 'runologi runinskrift runsten runor runristning'
    when 'medeltid'             then 'medeltid medeltida'
    when 'stenålder'            then 'stenålder neolitikum mesolitikum'
    when 'bronsålder'           then 'bronsålder'
    when 'gravar_osteologi'     then 'gravar osteologi gravfält skelett ben begravning'
    when 'numismatik'           then 'numismatik mynt myntfynd myntskatt'
    when 'marinarkeologi'       then 'marinarkeologi vrak skeppsvrak farled undervattensarkeologi'
    when 'fornborg_befästning'  then 'fornborg befästning borg fästning'
    when 'ortnamn'              then 'ortnamn namn namnforskning onomastik'
    else hs.category
  end
from public.historical_sources hs
where hs.id = sd.entity_id
  and sd.entity_type = 'source'
  and hs.collection = 'Fornvännen'
  and hs.category is not null
  and sd.body_sv not like '%[kat:%';   -- idempotent
