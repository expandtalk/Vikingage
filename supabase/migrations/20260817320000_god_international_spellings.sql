-- "Thor" gav nästan inget medan "Tor" gav rikt — internationella/fornnordiska gudanamn saknades i
-- sök-texten. Väv in dem i gudarnas body_sv (tsv_sv genereras → regenereras). Så hittar engelska/
-- latinska/ON-stavningar rätt gud: Thor→Tor, Odin→Oden, Freyr→Frej, Freyja→Freja … FAKTA (namnvarianter),
-- inte tolkning. Idempotent: markören '[alt:' hindrar dubbel-invävning.

update public.search_document sd
set body_sv = sd.body_sv || ' [alt:] ' ||
  case sd.label
    when 'Tor'      then 'Thor Þórr Þórr Donar Thunar Thunor'
    when 'Oden'     then 'Odin Óðinn Woden Wotan Woden'
    when 'Frej'     then 'Freyr Frey Yngvi Ing Yngve'
    when 'Freja'    then 'Freyja Freya Fröja'
    when 'Frigg'    then 'Frigga Frige Frija'
    when 'Balder'   then 'Baldr Baldur'
    when 'Loke'     then 'Loki Loptr Lopt'
    when 'Njörd'    then 'Njörðr Njord Njordr'
    when 'Höder'    then 'Höðr Hodr Hod Hoder'
    when 'Heimdall' then 'Heimdallr Heimdal'
    when 'Brage'    then 'Bragi'
    when 'Idun'     then 'Iðunn Idunn Iduna'
    when 'Ägir'     then 'Ægir Aegir Aegir'
    when 'Hel'      then 'Hela'
    when 'Forsete'  then 'Forseti'
    when 'Gefion'   then 'Gefjon Gefjun Gefion'
    when 'Ran'      then 'Rán Ran'
    when 'Mimer'    then 'Mímir Mimir'
    when 'Nanna'    then 'Nanna'
    when 'Sif'      then 'Sif'
    when 'Jord'     then 'Jörð Jord Fjörgyn'
    else sd.label
  end
where sd.entity_type = 'god'
  and sd.body_sv not like '%[alt:]%';

-- Verifiera-hjälp: rebuild ej nödvändig (tsv genererad ur body_sv).
