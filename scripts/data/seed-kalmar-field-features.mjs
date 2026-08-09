// Seed: Kalmar medeltidskarta — kurerad fältkorpus (D. Larsson), källkritisk.
// Idempotent: raderar alla rader med source LIKE 'D. Larsson%' och återinsätter.
// INGEN GISSNING: koordinater = D. Larssons kartavläsning (WGS84). belegg_status per rad;
// tidsskikt (time_layer) skiljer medeltida Gamla stan från nya staden (Kvarnholmen 1640-tal) m.m.
// Se docs/kalmar-medeltidskarta-faltdata.md.
import pg from 'pg';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

const SRC = 'D. Larsson, fältkännedom';
// [name, feature_type, time_layer, lat, lng, route_group, seq, belegg_status, confidence, reconcile_ref, note]
const R = [
  // §1 Stensö-näset: drag + närmiljö
  ['Högås (badplats på ås)','headland','natural',56.642476,16.324806,null,null,'obelagt','low',null,'Ås/höjd → ej draglokal (kontrastevidens). Isof 935472 = Tveta sn (annan plats) — endast namntyp "Högås".'],
  ['Kalmar fiskeläge / Olsan','harbor','medieval',56.650644,16.33384,null,null,'belagt','medium','crossing_points: Olsan (äldre läge); location_hypotheses: Gustav Vasa-landstigning','Fiskeläge 1600-tal, mark fr. drottning Kristina (sekundärkälla). Olsan-etymologi obelagt.'],
  ['Dragvik — Västra sjön (drag V)','portage','crossing',56.645313,16.322569,'stenso_drag',1,'hypotes','medium',null,'Västra ansättningen av båtdraget över näset.'],
  ['Dragvik — tröskeln (smalaste)','portage','crossing',56.644953,16.323455,'stenso_drag',2,'hypotes','medium',null,'Smalaste stället. elevation ej mätt — DEM krävs för verifiering av draget.'],
  ['Dragvik — Dragviksudd (Kalmarsund)','portage','crossing',56.644551,16.324517,'stenso_drag',3,'belagt','medium','crossing_points: Dragvik — båtdragsnäs (ersätter grov punkt 56.6478/16.3151)','Sjökortsnamn Dragviksudd. drag- = båtdrag/portage (belagt appellativ, SOL).'],
  ['Flundran (ö)','island','natural',56.645956,16.329063,null,null,'belagt','medium',null,'Belagt namn ~1939–40 (foto). Äldre namn obelagt (kräver Isof).'],

  // §2 Landväg på sandås: Husgatan → Kungsgatan → Sandåsgatan → Södra vägen
  ['Husgatan (f.d.) S','road','multi_period',56.658369,16.353698,'esker_road',1,'tradition','medium',null,'Namnkedja: Husgatan → Kungsgatan → Sandåsgatan → Södra vägen. Följer sandås (esker) — TOLKNING.'],
  ['Husgatan (f.d.) N','road','multi_period',56.658774,16.353471,'esker_road',2,'tradition','medium',null,null],
  ['Kungsgatan 1','road','multi_period',56.658871,16.353332,'esker_road',3,'tradition','medium',null,null],
  ['Kungsgatan 13C','road','multi_period',56.660926,16.347455,'esker_road',4,'tradition','medium',null,null],
  ['Kungsgatan 19','road','multi_period',56.661302,16.345677,'esker_road',5,'tradition','medium',null,null],
  ['Vasaskolan','road','multi_period',56.662066,16.34375,'esker_road',6,'tradition','medium',null,null],
  ['Kungsgatan 29A','road','multi_period',56.662312,16.34356,'esker_road',7,'tradition','medium',null,null],
  ['Kungsgatan 39 (namnbyte → Sandåsgatan)','road','multi_period',56.662799,16.342223,'esker_road',8,'tradition','medium',null,'Här byter gatan namn till Sandåsgatan.'],
  ['Sandåsgatan 5','road','multi_period',56.662738,16.340145,'esker_road',9,'tradition','medium',null,null],
  ['Sandåsgatan 17B','road','multi_period',56.663737,16.337167,'esker_road',10,'tradition','medium',null,null],
  ['Södra vägen 56','road','multi_period',56.663922,16.337013,'esker_road',11,'tradition','medium',null,null],
  ['Södra vägen (NV, ut)','road','multi_period',56.669921,16.32004,'esker_road',12,'tradition','medium',null,null],

  // §5 Medeltidshamnen, slott, Ölandskajen + hamn-/tjärhovsområde
  ['Gamla medeltidshamnen','harbor','medieval',56.659158,16.355699,null,null,'tradition','low',null,'Approx. Tidigare taggad "almar slott" (tryckfel). Rita mot medeltida strandlinje.'],
  ['Kalmar slott (mitten)','castle','medieval',56.657954,16.355445,null,null,'belagt','high','heritage_sites: Kalmar slott','Slottets mittpunkt.'],
  ['Ölandskajen','quay','medieval',56.659045,16.358809,null,null,'tradition','medium',null,'Kalmar-sidans Öland-landning (överfart mot Färjestaden).'],
  ['Park Hermina (hamnområde)','street','medieval',56.660418,16.356731,'medeltidshamn_area',1,'tradition','low',null,'Hamn-/tjärhovsområde vid medeltidshamnen (Tjärhov = tjärgård).'],
  ['Järnvägsgatan (hamnomr.) N','street','medieval',56.66165,16.356915,'medeltidshamn_area',2,'tradition','low',null,null],
  ['Järnvägsgatan (hamnomr.) S','street','medieval',56.659331,16.359034,'medeltidshamn_area',3,'tradition','low',null,null],
  ['Tjärhovsgatan 5 a','street','medieval',56.658365,16.359417,'medeltidshamn_area',4,'tradition','low',null,null],
  ['Tjärhovsgatan 5 b','street','medieval',56.658073,16.358196,'medeltidshamn_area',5,'tradition','low',null,null],

  // §6 Gamla stans gatunät (medeltida)
  ['Västerlånggatan 1','street','medieval',56.661789,16.355191,'vasterlanggatan',1,'tradition','medium',null,'"lär ha varit" gammal gata (D. Larsson) — tradition, obekräftat medeltida.'],
  ['Västerlånggatan 2','street','medieval',56.661877,16.354925,'vasterlanggatan',2,'tradition','medium',null,null],
  ['Västerlånggatan 4A','street','medieval',56.661772,16.35407,'vasterlanggatan',3,'tradition','medium',null,null],
  ['Västerlånggatan 5A','street','medieval',56.661736,16.353478,'vasterlanggatan',4,'tradition','medium',null,null],
  ['Västerlånggatan 7A','street','medieval',56.661647,16.352912,'vasterlanggatan',5,'tradition','medium',null,null],
  ['Västerlånggatan 11','street','medieval',56.661383,16.352109,'vasterlanggatan',6,'tradition','medium',null,null],
  ['Västerlånggatan 17','street','medieval',56.66107,16.351241,'vasterlanggatan',7,'tradition','medium',null,null],
  ['Västerlånggatan 17B','street','medieval',56.661025,16.351072,'vasterlanggatan',8,'tradition','medium',null,null],
  ['Västerlånggatan 23','street','medieval',56.660506,16.35038,'vasterlanggatan',9,'tradition','medium',null,null],
  ['Gamla Kungsgatan 13','street','medieval',56.660269,16.350049,'vasterlanggatan',10,'tradition','medium',null,null],
  ['Västerlånggatan 29B','street','medieval',56.660154,16.349882,'vasterlanggatan',11,'tradition','medium',null,null],
  ['Österlånggatan 10','street','medieval',56.659541,16.351548,'osterlanggatan',1,'tradition','medium',null,'Gamla stans gatunät mot slottet.'],
  ['Gamla Kungsgatan 2','street','medieval',56.659921,16.352018,'osterlanggatan',2,'tradition','medium',null,null],
  ['Slottsvägen 1B a','street','medieval',56.659941,16.352558,'osterlanggatan',3,'tradition','medium',null,null],
  ['Slottsvägen 1B b','street','medieval',56.660039,16.3528,'osterlanggatan',4,'tradition','medium',null,null],
  ['Slottsvägen 3D','street','medieval',56.659803,16.353558,'osterlanggatan',5,'tradition','medium',null,null],

  // §6b Spikgatan (Kvarnholmen — nya staden)
  ['Spikgatan 4 a','street','new_town_1600s',56.6644,16.354496,'spikgatan',1,'tradition','medium',null,'Kvarnholmen (nya staden 1640-tal), EJ medeltida. "lär vara en av Kalmars äldsta gator".'],
  ['Spikgatan 4 b','street','new_town_1600s',56.664471,16.354359,'spikgatan',2,'tradition','medium',null,null],
  ['Spikgatan 6','street','new_town_1600s',56.664486,16.35413,'spikgatan',3,'tradition','medium',null,null],
  ['Spikgatan 8','street','new_town_1600s',56.664506,16.353745,'spikgatan',4,'tradition','medium',null,null],
  ['Spikgatan 10','street','new_town_1600s',56.664527,16.353322,'spikgatan',5,'tradition','medium',null,null],
  ['Spikgatan c','street','new_town_1600s',56.664526,16.353085,'spikgatan',6,'tradition','medium',null,null],
  ['Spikgatan d','street','new_town_1600s',56.664528,16.352887,'spikgatan',7,'tradition','medium',null,null],
  ['Spikgatan e','street','new_town_1600s',56.664516,16.3527,'spikgatan',8,'tradition','medium',null,null],
  ['Spikgatan f','street','new_town_1600s',56.664489,16.352538,'spikgatan',9,'tradition','medium',null,null],
  ['Spikgatan g','street','new_town_1600s',56.664475,16.352427,'spikgatan',10,'tradition','medium',null,null],
  ['Spikgatan h','street','new_town_1600s',56.664462,16.352355,'spikgatan',11,'tradition','medium',null,null],

  // §7 medeltida stadskärna
  ['Gamla kyrkogården','cemetery','medieval',56.660239,16.352146,null,null,'belagt','medium','heritage_sites: S:t Nicolai (Bykyrkan)','Reconcile — samma plats som befintlig kyrkogårds-rad.'],
  ['Gamla torget','square','medieval',56.660124,16.352538,null,null,'belagt','medium','heritage_sites: Kalmars medeltida torg (gamla Stortorget)','Reconcile — samma plats.'],

  // §8 kyrkligt
  ['Södra kapellet','chapel','medieval',56.657851,16.351353,null,null,'obelagt','low',null,'Klostergatan → medeltida gråbrödrakloster? Kräver verifiering. "Södra" antyder fler kapell.'],

  // §4 befästning (Kvarnholmen, nya staden) + Grimskär
  ['Sveaplan (befästning)','fortification','new_town_1600s',56.664737,16.357976,'kvarnholmen_befast',1,'belagt','medium',null,'1600-talets stadsbefästning/kanallinje runt Kvarnholmen (fort_hypothesis Kalmar).'],
  ['Ravelinen/Anstalten a','fortification','new_town_1600s',56.663858,16.358201,'kvarnholmen_befast',2,'belagt','medium',null,null],
  ['Ravelinen/Anstalten b','fortification','new_town_1600s',56.663408,16.358762,'kvarnholmen_befast',3,'belagt','medium',null,null],
  ['Olof Palmes gata a','fortification','new_town_1600s',56.662616,16.357865,'kvarnholmen_befast',4,'belagt','medium',null,null],
  ['Stationsgatan','fortification','new_town_1600s',56.662419,16.35865,'kvarnholmen_befast',5,'belagt','medium',null,null],
  ['Olof Palmes gata b','fortification','new_town_1600s',56.662895,16.358988,'kvarnholmen_befast',6,'belagt','medium',null,null],
  ['Larmtorget','fortification','new_town_1600s',56.662941,16.35944,'kvarnholmen_befast',7,'belagt','medium',null,null],
  ['Larmgatan 13 a','fortification','new_town_1600s',56.663758,16.359508,'kvarnholmen_befast',8,'belagt','medium',null,null],
  ['Larmgatan 13 b','fortification','new_town_1600s',56.663786,16.359061,'kvarnholmen_befast',9,'belagt','medium',null,null],
  ['Larmgatan N','fortification','new_town_1600s',56.664698,16.35856,'kvarnholmen_befast',10,'belagt','medium',null,null],
  ['Södra Kanalgatan','fortification','new_town_1600s',56.665343,16.359115,'kvarnholmen_befast',11,'belagt','medium',null,null],
  ['Grimskärs skans','fortification','new_town_1600s',56.651965,16.370375,null,null,'belagt','high','heritage_sites: Grimskär – Grimskärs skans','Ö-skans, inloppsförsvar. Reconcile.'],

  // §9 sundet / Öland-överfart / öar / nabbar / Öland V-kust
  ['Svinö','island','crossing',56.680495,16.37605,null,null,'belagt','medium',null,'Fastlandets brofäste (Ölandsbron, modern).'],
  ['Svinö (stor ö)','island','crossing',56.680253,16.378496,null,null,'belagt','medium',null,null],
  ['Ölandsleden (Svinö N a)','road','modern',56.683219,16.382884,'olandsleden',1,'belagt','high',null,'Modern led/bro mot Öland — ej medeltida.'],
  ['Ölandsleden (Svinö N b)','road','modern',56.685841,16.375741,'olandsleden',2,'belagt','high',null,null],
  ['Ölandsleden (punkt)','road','modern',56.674751,16.402461,'olandsleden',3,'belagt','high',null,null],
  ['Skallöarna','island','natural',56.677171,16.402593,null,null,'belagt','medium',null,null],
  ['Stora Vitskäret a','island','natural',56.682465,16.448293,null,null,'belagt','medium',null,'Skär vid Öland-sidans landning.'],
  ['Stora Vitskäret b','island','natural',56.679582,16.444616,null,null,'belagt','medium',null,null],
  ['Färjestaden hamn','harbor','crossing',56.649993,16.464264,null,null,'belagt','medium',null,'Öland-sidans färjeläge (överfart: Ölandskajen ↔ Färjestaden). Exakt medeltida läge kräver källa.'],
  ['Jutnabben','headland','hypothesis',56.684771,16.368351,null,null,'hypotes','low',null,'Jut- = jutar/danskar? Namnpar med Svensknabben → Kalmarsund som dansk–svensk gränszon. Kräver Isof/SOL.'],
  ['Svensknabben','headland','hypothesis',56.691873,16.372046,null,null,'hypotes','low',null,'Svensk- = svenskar? Par med Jutnabben.'],
  ['Stora Rör × Isgärdevägen','locality','natural',56.754728,16.537725,null,null,'belagt','medium',null,'Ölands västkust N om Färjestaden.'],
  ['Stora Rör (hamn, "bra segling")','harbor','natural',56.756419,16.527934,null,null,'belagt','medium',null,'Naturlig hamn/landning Öland V; gynnsam segling (Färjestadens segelsällskap).'],
  ['Ispeudde fyr','headland','natural',56.74381,16.513331,null,null,'belagt','medium',null,'Udde/sjömärke Öland V (fyren modern; udden naturlig navigationspunkt).'],
  ['Lökenäs','headland','natural',56.723667,16.507869,null,null,'belagt','medium',null,'Näs Öland V, S om Färjestaden.'],
  ['Röhälla badplats','headland','natural',56.713528,16.501679,null,null,'belagt','medium',null,'Öland V, S om Lökenäs.'],
  ['Norra Saxnäs','headland','natural',56.693247,16.491176,null,null,'belagt','medium',null,'Öland V, Algutsrum sn (samma sn som Gråborg).'],
  ['Södra Saxnäs','headland','natural',56.684472,16.488358,null,null,'belagt','medium',null,'Öland V; par med Norra Saxnäs.'],

  // §10 grund
  ['Enstevsgrundet','shoal','natural',56.655573,16.408397,null,null,'belagt','medium',null,'Grund i sundet (farled). Namnstavning sjökort — verifiera.'],
  ['Norra Midsundsgrundet','shoal','natural',56.649485,16.415997,null,null,'belagt','medium',null,null],
  ['Ölands södra Trendingsgrund','shoal','natural',56.649666,16.432791,null,null,'belagt','low',null,'Namnstavning osäker — verifiera mot sjökort.'],

  // §11 Kvarnholmen (nya staden) + varvsöar
  ['Kattrumpan','locality','new_town_1600s',56.665906,16.372122,null,null,'belagt','medium',null,'Kvarnholmens yttersta NÖ-spets (nya staden).'],
  ['Laboratorieholmen','island','new_town_1600s',56.6667,16.375376,null,null,'belagt','low',null,'Varvskroken; namn sentida.'],
  ['Varvsholmen','island','new_town_1600s',56.669622,16.37789,null,null,'belagt','medium','heritage_sites: Varvsholmen begravningsplats/skans','Samma öområde — reconcile.'],

  // §12 gravplatser
  ['Björkenäs pestkyrkogård','cemetery','natural',56.715718,16.367569,null,null,'obelagt','low',null,'Pestkyrkogård/massgrav N om staden. Vilken epidemi (1350/1710–11/annan) = obelagt.'],

  // §13 lokaler / gods
  ['Värsnäs','locality','natural',56.724078,16.370449,null,null,'belagt','low',null,'Näs N om staden. Led -näs. Roll ej angiven.'],
  ['Stävlö slott','estate','multi_period',56.752405,16.361647,null,null,'belagt','medium',null,'Gods/herrgård N om Kalmar. Möjlig estates/maktgeografi-koppling.'],
  ['Björnö slott','estate','multi_period',56.770506,16.383533,null,null,'belagt','medium',null,'Gods N om Kalmar (herrgårdskedja Stävlö → Björnö).'],
  ['Revsudden','headland','natural',56.775291,16.474949,null,null,'belagt','medium',null,'Udde vid Drags kanal (§14).'],
  ['Vadstenalund','locality','hypothesis',56.775185,16.440324,null,null,'hypotes','low',null,'Ev. vad- = vadställe/ford (fler överfartsnamn)? Obelagt — kan vara Vadstena/personnamn.'],

  // §14 andra båtdraget
  ['Drags kanal (Revsudden)','portage','crossing',56.779471,16.416487,null,null,'belagt','medium',null,'Andra båtdraget: bebyggelse "Drag" + Drags kanal → drag- = portage (SOL). Kanal modern; förhistoriskt drag = hypotes.'],
];

async function main() {
  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query("delete from public.kalmar_field_features where source like 'D. Larsson%'");
    let n = 0;
    for (const [name, ft, tl, lat, lng, rg, seq, bel, conf, rec, note] of R) {
      await client.query(
        `insert into public.kalmar_field_features
           (name, feature_type, time_layer, lat, lng, route_group, seq, belegg_status, confidence, source, reconcile_ref, note)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [name, ft, tl, lat, lng, rg, seq, bel, conf, SRC, rec, note]);
      n++;
    }
    console.log(`✅ ${n} kalmar_field_features seedade.`);
  } finally {
    await client.end();
  }
}
main().catch(e => { console.error(e); process.exit(1); });
