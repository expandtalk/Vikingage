# Royal Chronicles — revisionsunderlag (2026-07-18)

Underlag från Daniel för att revidera `/royal-chronicles`. **Ännu ej importerat** — kräver
schemakartläggning först (se nedan). Källa: Daniels revisionsdokument v1.0 (Weibullskolans
källvärdering; Adam av Bremen, Rimbert, ASC, Annals of Ulster, Nestorskrönikan m.fl.).

## Filer
- `regents_missing.csv` — ~90 saknade regenter/aktörer (Sverige, Danmark, Norge, Kievrus, Västerleden/Danelagen, anglosaxare). Kolumner: region, name, reign_start/end, dynasty, role, de_facto_ruler, classification (H/SL/L), node_control, external_attestation (`;`-separerad), runestone, archaeology, sources.
- `relations_edges.csv` — ~40 person→person-relationer (äktenskap, förälder, fostran, exil_hos, tjänst_hos, fadderskap, dråp/strid). Dynastinätet Uppsala–Roskilde–Nidaros–Kiev–London.

## Rättelser i BEFINTLIGA poster (kör som UPDATE efter verifiering)
| # | Post | Fel | Åtgärd |
|---|------|-----|--------|
| 1 | Gustav Vasa | Etiketterad Bjälboätten | → Vasaätten |
| 2 | Magnus Eriksson | Etiketterad Eriksätten | → Bjälboätten (Folkungaätten) |
| 3 | Sigrid Storråda / Astrid Olofsdotter | Bjälboätten (anakronism ~200 år); Astrid 1050–1100 inkonsistent | Ta bort ättetikett; Astrid → ca 1015–1035 |
| 4 | Ragnhild Eriksdotter | "mor till Harald Gråfäll" fel (det var Gunnhild kongemor) | Korrigera; ev. lägg till Gunnhild |
| 5 | Beatrix av Wittelsbach | Kopplad till fel Erik Magnusson | Dela upp: hertig Erik (d.1318) ⚭ Ingeborg Håkansdotter; Beatrix av Bayern ⚭ Erik XII (d.1359) |
| 6 | Toke Gormsson / Björn Jarl / Sibir Fultarsson | Regentskap/Roskilde 983/Halör 984/Borgeby = spekulativ rekonstruktion | Flagga som spekulativ; behåll bara runstensbelagt (DR 295, Öl 1); spåra importkälla |
| 7 | Ingvar Vittfarne | Roll = King | → Expeditionsledare (kallas aldrig konung på ~26 Ingvarsstenar) |
| 8 | Dubbletter | Gorm (×3), Harald Blåtand (×2), Olav Kyrre (×2), Magnus Haraldsson (×2), Håkan Magnusson (×2) | Deduplicera → kanonisk entitet + flera roller |
| 9 | Dynastinamn | Stavfel "Sverkerätren" | → Sverkerska ätten |
| 10 | "Olof III, son till Erik Magnusson" | Kan ej identifieras i litteraturen | Verifiera källa eller ta bort (dataartefakt) |
| 11 | Ynglingar för Erik Segersäll–Anund Jakob | Sagakonstruktion | → "Munsöätten (Erik Segersälls ätt)" m. osäkerhetsflagga; reservera "Ynglingaätten" för Adils/Ottar (Legendary) |

## Schemautökning (föreslås — kräver migration)
1. Roll-enum + boolesk `de_facto_ruler` skild från titel.
2. Sekventiella roller per person (`person_role` m. tidsintervall) — Erik av Pommern kung→sjörövarfurste→hertig; Eirik Blodyx Norge→York.
3. `external_attestation` (multivärde: frankisk/anglosaxisk/irisk/bysantinsk/arabisk/rysk/påvlig/tysk).
4. `agnatic_family` skild från `political_name` (Sture-fallet).
5. `maktdomän` i stället för nationskolumn före ~1100 (svear/götar/Jylland/Tröndelag/Hedeby-näset).
6. `node_control` för maritima aktörer (sund/hamn/led).
7. Ny entitetstyp "maritim organisation" (vitaliebröderna, hansan, Tyska orden).
8. Ny regionkolumn "Västerleden" (Danelagen/York/Dublin/Man).
9. Relationstabell `relation(person_a, person_b, typ, tid, källa)`.

## Importplan (INNAN körning)
1. Kartlägg nuvarande schema: `historical_kings`, `royal_dynasties`, `king_inscription_links`, `historical_sources`, `royal_chronicles` (kolumner + enums + RLS).
2. Mappa CSV-kolumner → DB-kolumner; besluta vilka schemautökningar (1–9) som görs nu vs senare.
3. Generera INSERT/UPDATE-SQL (samma metod som rundata-crosswalken: inline VALUES, ingen temptabell).
4. Deduplicera FÖRST (rättelse #8) så inte nya dubbletter skapas.
5. Integritetscheck efter import: `external_attestation IS NOT NULL AND classification = 'Legendary'` ska ge 0 rader.
