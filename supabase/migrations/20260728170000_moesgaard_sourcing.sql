-- Moesgaard-sourcing: fäst J.C. Moesgaards specifika verk på de två myntposter där han
-- är rätt auktoritet (Rouen/normandiska mynt i Baltikum; engelsk myntimport till Norden).
-- APPEND (||) till befintliga sources — image-credit m.m. bevaras. WHERE-guard hindrar
-- dubbelkörning. De rena svenska Sigtuna-pengarna berörs EJ (Malmer/Jonsson-domän).

-- 1) Vikby-skatten: Rouen-myntet → Moesgaards Rouen/Normandie-i-Baltikum-corpus.
UPDATE public.coins
SET sources = sources ||
  ' Om normandiska/Rouen-mynt i Baltikum under vikingatid, se Moesgaard, J.C. 2005, ' ||
  '"Monnaies normandes dans les régions baltiques à l''époque viking", Revue numismatique 161:123–144; ' ||
  'Moesgaard 2018, "A Tenth-century Hoard of Coins Mostly in the Name of St Ouen of Rouen", ' ||
  'Numismatic Chronicle 178:322–326; Moesgaard 2014, "The Viking Invasions 885–889 and the Activity ' ||
  'of the Mint of Rouen", i Early Medieval Monetary History (Studies in Memory of Mark Blackburn), Ashgate.'
WHERE name = 'Vikby-skatten'
  AND sources NOT ILIKE '%Monnaies normandes%';

-- 2) ETHELRED-efterpräglingen (Olof Skötkonungs Sigtuna-imitation av Æthelred II:s pennies)
--    → Moesgaard om engelsk myntimport/anglo-vikingamynt.
UPDATE public.coins
SET sources = sources ||
  ' — Efterprägling med Æthelred II:s namn (engelsk förebild). Om engelska mynts import och ' ||
  'cirkulation i Norden, se Moesgaard, J.C. 2006, "The import of English coins to the Northern Lands: ' ||
  'Some remarks on coin circulation in the Viking age based on new evidence from Denmark", i B. Cook & ' ||
  'G. Williams (red.), Coinage and History in the North Sea World c. 500–1250, Brill; jfr Moesgaard & ' ||
  'Gooch 2014, "Anglo-Viking Coins in France", Studies in Early Medieval Coinage 3:141–152.'
WHERE name = 'Efterprägling "ETHELRED REX", Sigtuna'
  AND sources NOT ILIKE '%import of English coins%';
