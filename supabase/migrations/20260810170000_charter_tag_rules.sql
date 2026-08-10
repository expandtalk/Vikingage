create table if not exists sdhk.charter_tag_rules (
  rule_id   text primary key,
  facett    text not null,
  varde     text not null,
  pattern   text not null,
  pattern_type text not null check (pattern_type in ('regex_summary','lang_map','date_flag')),
  konfidens text not null check (konfidens in ('hög','medel','låg')),
  aktiv     boolean not null default true,
  kommentar text
);

insert into sdhk.charter_tag_rules (rule_id,facett,varde,pattern,pattern_type,konfidens,kommentar) values
-- AKTÖR
('aktor.pave','aktor','pave','påven|\ypåve\y|apostolisk|bulla','regex_summary','medel','påve-utfärdare/ärende'),
('aktor.kung','aktor','kung','\ykonung|\ykungen|kung [A-ZÅÄÖ]|drottning|\yhertig|riksföreståndare','regex_summary','medel','undvik kungör: kräv konung/kung+namn'),
('aktor.kyrkohierarki','aktor','kyrkohierarki','biskop|ärkebiskop|domkapitl|domkapitel|domprost|\ykanik|\yprost\y|dekan','regex_summary','medel',null),
('aktor.kloster','aktor','kloster','kloster|\yabbot|abbedissa|\ykonvent|\yprior\y|munk|nunna','regex_summary','medel',null),
('aktor.stad_stadsrad','aktor','stad_stadsrad','borgmästare|rådmän|rådet i|stadens råd|byfogde|\yborgare','regex_summary','medel',null),
('aktor.gille','aktor','gille','\ygille|gillet|\yskrå','regex_summary','hög',null),
('aktor.harad_ting','aktor','harad_ting','härad|häradsting|\ylagman|landsting|\yting\y|nämnd','regex_summary','låg','ting/nämnd grovt'),
('aktor.socken','aktor','socken','\ysocken|sockenkyrka|kyrkoherde|\ysochn','regex_summary','medel',null),
('aktor.privat_fralse','aktor','privat_fralse','riddare|väpnare|\yfru \y|herr [A-ZÅÄÖ]|frälse','regex_summary','låg','grov frälse/privat'),
-- AKTYP
('aktyp.jordtransaktion','aktyp','jordtransaktion','\ysäljer|\yköp|\ybyter|\ybyte\y|pantsätt|\ypant\y|skänker|\ygåva|förläning|överlåt|upplåt','regex_summary','medel',null),
('aktyp.testamente','aktyp','testamente','testamente|testamenterar|själagåva','regex_summary','hög',null),
('aktyp.dom_tvist','aktyp','dom_tvist','dombrev|\ydömer|\ytvist|rättar|skiljedom','regex_summary','medel',null),
('aktyp.fred_forbund','aktyp','fred_forbund','\yfred\y|\yfreden|förbund|stillestånd|förlikn|överenskomm|dagtingan','regex_summary','medel',null),
('aktyp.privilegium_reform','aktyp','privilegium_reform','privilegi|\ystadga|\ystadgar|förordn|\yreform','regex_summary','medel',null),
('aktyp.skatt','aktyp','skatt','\yskatt|\ytull\y|\yavrad|landgille|\yledung|\ytionde','regex_summary','medel',null),
('aktyp.stadfastelse','aktyp','stadfastelse','stadfäst|bekräftar|förnyar','regex_summary','medel',null),
('aktyp.vidimation','aktyp','vidimation','vidimer|vidimation|transsumpt','regex_summary','hög',null),
-- ÄKTHET (date_raw + comments)
('akthet.forfalskning','akthet','forfalskning','förfalskn','date_flag','hög','date_raw/comments flaggad'),
('akthet.oakta','akthet','omtvistad','oäkta|skenoriginal|betvivlats|interpolat','date_flag','medel','date_raw/comments'),
-- GEO / RELATION
('geo.hansan','geo','hansan','Lübeck|Hansa|hanse|Danzig|Reval|\yRiga\y|Stralsund|Rostock|Wismar|Greifswald','regex_summary','medel','Hansa via stadsnamn'),
('geo.utland','geo','utland','\yEngland|\yFrankrike|\yavignon|\ykurian|påvestolen|\yRom\y|Flandern','regex_summary','låg','utländsk relation grovt'),
-- KÖN/ROLL
('konroll.kvinna','konroll','kvinna_omnamnd','\yänka|\yänkan|\yhustru|\yfru \y|jungfru|abbedissa|priorinna|\ydotter|\yhennes\y','regex_summary','låg','kvinna omnämnd (grovt)'),
('konroll.anka','konroll','anka','\yänka|\yänkan','regex_summary','medel',null),
('konroll.kvinnors_rattshandling','konroll','kvinnors_rattshandling','morgongåva|hemgift|änkas rätt|kvinnofrid','regex_summary','medel','skarp underfacett'),
-- SPRÅK (lang_map: normalisera lang_raw)
('sprak.svenska','sprak','svenska','svensk','lang_map','hög',null),
('sprak.latin','sprak','latin','latin','lang_map','hög',null),
('sprak.medellagtyska','sprak','medellagtyska','\ytysk','lang_map','hög','tyska i SDHK = medellågtyska'),
('sprak.danska','sprak','danska','dansk','lang_map','hög',null),
('sprak.norska','sprak','norska','norsk','lang_map','hög',null),
('sprak.nederlandska','sprak','nederlandska','nederländ','lang_map','hög',null),
('sprak.franska','sprak','franska','fransk','lang_map','hög',null);
