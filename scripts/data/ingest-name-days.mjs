// Namnsdag → name_authority. Råtext (Wikipedia namnlängden, CC BY-SA; datum=fakta) parsas av kod
// (ingen handmappning). Källa: Wikipedia + Isof. Holiday-rader och parenteser filtreras bort.
import pg from 'pg';import {readFileSync} from 'node:fs';
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();const q=async(t,p)=>(await c.query(t,p)).rows;
const MONTHS={januari:1,februari:2,mars:3,april:4,maj:5,juni:6,juli:7,augusti:8,september:9,oktober:10,november:11,december:12};
const RAW=`
2 januari Svea
3 januari Alfred, Alfrida
4 januari Rut
5 januari Hanna, Hannele
6 januari Kasper, Melker, Baltsar
7 januari August, Augusta
8 januari Erland
9 januari Gunnar, Gunder
10 januari Sigurd, Sigbritt
11 januari Jan, Jannike
12 januari Frideborg, Fridolf
13 januari Knut
14 januari Felix, Felicia
15 januari Laura, Lorentz
16 januari Hjalmar, Helmer
17 januari Anton, Tony
18 januari Hilda, Hildur
19 januari Henrik, Henry
20 januari Fabian, Sebastian
21 januari Agnes, Agneta
22 januari Vincent, Viktor
23 januari Frej, Freja
24 januari Erika
25 januari Paul, Pål
26 januari Bodil, Boel
27 januari Göte, Göta
28 januari Karl, Karla
29 januari Diana
30 januari Gunilla, Gunhild
31 januari Ivar, Joar
1 februari Max, Maximilian
3 februari Disa, Hjördis
4 februari Ansgar, Anselm
5 februari Agata, Agda
6 februari Dorotea, Doris
7 februari Rikard, Dick
8 februari Berta, Bert
9 februari Fanny, Franciska
10 februari Iris
11 februari Yngve, Inge
12 februari Evelina, Evy
13 februari Agne, Ove
14 februari Valentin
15 februari Sigfrid
16 februari Julia, Julius
17 februari Alexandra, Sandra
18 februari Frida, Fritiof
19 februari Gabriella, Ella
20 februari Vivianne
21 februari Hilding
22 februari Pia
23 februari Torsten, Torun
24 februari Mattias, Mats
25 februari Sigvard, Sivert
26 februari Torgny, Torkel
27 februari Lage
28 februari Maria, Maja
1 mars Albin, Elvira
2 mars Ernst, Erna
3 mars Gunborg, Gunvor
4 mars Adrian, Adriana
5 mars Tora, Tove
6 mars Ebba, Ebbe
7 mars Camilla
8 mars Siv, Saga
9 mars Torbjörn, Torleif
10 mars Edla, Ada
11 mars Edvin, Egon
12 mars Viktoria, Regina
13 mars Greger
14 mars Matilda, Maud
15 mars Kristoffer, Christel
16 mars Herbert, Gilbert
17 mars Gertrud
18 mars Edvard, Edmund
19 mars Josef, Josefina
20 mars Joakim, Kim
21 mars Bengt
22 mars Kennet, Kent
23 mars Gerda, Gerd
24 mars Gabriel, Rafael
26 mars Emanuel
27 mars Rudolf, Ralf
28 mars Malkolm, Morgan
29 mars Jonas, Jens
30 mars Holger, Holmfrid
31 mars Ester, Noa
1 april Harald, Hervor
2 april Gudmund, Ingemund
3 april Ferdinand, Nanna
4 april Marianne, Marlene
5 april Irene, Irja
6 april Vilhelm, William
7 april Irma, Irmelin
8 april Nadja, Tanja
9 april Otto, Ottilia
10 april Ingvar, Ingvor
11 april Ulf, Ylva
12 april Liv
13 april Artur, Douglas
14 april Tiburtius
15 april Olivia, Oliver
16 april Patrik, Patricia
17 april Elias, Elis
18 april Valdemar, Volmar
19 april Olaus, Ola
20 april Amalia, Amelie
21 april Anneli, Annika
22 april Allan, Glenn
23 april Georg, Göran
24 april Vega
25 april Markus
26 april Teresia, Terese
27 april Engelbrekt
28 april Ture, Tyra
29 april Tyko
30 april Mariana
1 maj Valborg
2 maj Filip, Filippa
3 maj John, Jane
4 maj Monika, Mona
5 maj Gotthard, Erhard
6 maj Marit, Rita
7 maj Carina, Carita
8 maj Åke
9 maj Reidar, Reidun
10 maj Esbjörn, Styrbjörn
11 maj Märta, Märit
12 maj Charlotta, Lotta
13 maj Linnea, Linn
14 maj Halvard, Halvar
15 maj Sofia, Sonja
16 maj Ronald, Ronny
17 maj Rebecka, Ruben
18 maj Erik
19 maj Maj, Majken
20 maj Karolina, Carola
21 maj Konstantin, Conny
22 maj Hemming, Henning
23 maj Desideria, Desirée
24 maj Ivan, Vanja
25 maj Urban
26 maj Vilhelmina, Vilma
27 maj Beda, Blenda
28 maj Ingeborg, Borghild
29 maj Yvonne, Jeanette
30 maj Vera, Veronika
31 maj Petronella, Pernilla
1 juni Gun, Gunnel
2 juni Rutger, Roger
3 juni Ingemar, Gudmar
4 juni Solbritt, Solveig
5 juni Bo
6 juni Gustav, Gösta
7 juni Robert, Robin
8 juni Eivor, Majvor
9 juni Börje, Birger
10 juni Svante, Boris
11 juni Bertil, Berthold
12 juni Eskil
13 juni Aina, Aino
14 juni Håkan, Hakon
15 juni Margit, Margot
16 juni Axel, Axelina
17 juni Torborg, Torvald
18 juni Björn, Bjarne
19 juni Germund, Görel
20 juni Linda
21 juni Alf, Alvar
22 juni Paulina, Paula
23 juni Adolf, Alice
25 juni David, Salomon
26 juni Rakel, Lea
27 juni Selma, Fingal
28 juni Leo
29 juni Peter, Petra
30 juni Elof, Leif
1 juli Aron, Mirjam
2 juli Rosa, Rosita
3 juli Aurora
4 juli Ulrika, Ulla
5 juli Laila, Ritva
6 juli Esaias, Jessika
7 juli Klas
8 juli Kjell
9 juli Jörgen, Örjan
10 juli André, Andrea
11 juli Eleonora, Ellinor
12 juli Herman, Hermine
13 juli Joel, Judit
14 juli Folke
15 juli Ragnhild, Ragnvald
16 juli Reinhold, Reine
17 juli Bruno
18 juli Fredrik, Fritz
19 juli Sara
20 juli Margareta, Greta
21 juli Johanna
22 juli Magdalena, Madeleine
23 juli Emma, Emmy
24 juli Kristina, Kerstin
25 juli Jakob
26 juli Jesper, Jasmine
27 juli Marta
28 juli Botvid, Seved
29 juli Olof, Olle
30 juli Algot
31 juli Helena, Elin
1 augusti Per
2 augusti Karin, Kajsa
3 augusti Tage
4 augusti Arne, Arnold
5 augusti Ulrik, Alrik
6 augusti Alfons, Inez
7 augusti Dennis, Denise
8 augusti Silvia, Sylvia
9 augusti Roland
10 augusti Lars
11 augusti Susanna
12 augusti Klara
13 augusti Kaj
14 augusti Uno
15 augusti Stella, Estelle
16 augusti Brynolf
17 augusti Verner, Valter
18 augusti Ellen, Lena
19 augusti Magnus, Måns
20 augusti Bernhard, Bernt
21 augusti Jon, Jonna
22 augusti Henrietta, Henrika
23 augusti Signe, Signhild
24 augusti Bartolomeus
25 augusti Lovisa, Louise
26 augusti Östen
27 augusti Rolf, Raoul
28 augusti Fatima, Leila
29 augusti Hans, Hampus
30 augusti Albert, Albertina
31 augusti Arvid, Vidar
1 september Samuel, Sam
2 september Justus, Justina
3 september Alfhild, Alva
4 september Gisela
5 september Adela, Heidi
6 september Lilian, Lilly
7 september Kevin, Roy
8 september Alma, Hulda
9 september Anita, Annette
10 september Tord, Turid
11 september Dagny, Helny
12 september Åsa, Åslög
13 september Sture
14 september Ida, Ronja
15 september Sigrid, Siri
16 september Dag, Daga
17 september Hildegard, Magnhild
18 september Orvar
19 september Fredrika
20 september Elise, Lisa
21 september Matteus
22 september Maurits, Moritz
23 september Tekla, Tea
24 september Gerhard, Gert
25 september Tryggve
26 september Enar, Einar
27 september Dagmar, Rigmor
28 september Lennart, Leonard
29 september Mikael, Mikaela
30 september Helge
1 oktober Ragnar, Ragna
2 oktober Ludvig, Love
3 oktober Evald, Osvald
4 oktober Frans, Frank
5 oktober Bror
6 oktober Jenny, Jennifer
7 oktober Birgitta, Britta
8 oktober Nils
9 oktober Ingrid, Inger
10 oktober Harry, Harriet
11 oktober Erling, Jarl
12 oktober Valfrid, Manfred
13 oktober Berit, Birgit
14 oktober Stellan
15 oktober Hedvig, Hillevi
16 oktober Finn
17 oktober Antonia, Toini
18 oktober Lukas
19 oktober Tore, Tor
20 oktober Sibylla
21 oktober Ursula, Yrsa
22 oktober Marika, Marita
23 oktober Severin, Sören
24 oktober Evert, Eilert
25 oktober Inga, Ingalill
26 oktober Amanda, Rasmus
27 oktober Sabina
28 oktober Simon, Simone
29 oktober Viola
30 oktober Elsa, Isabella
31 oktober Edit, Edgar
2 november Tobias, Tim
3 november Hubert, Hugo
4 november Sverker
5 november Eugen, Eugenia
6 november Gustav Adolf
7 november Ingegerd, Ingela
8 november Vendela
9 november Teodor, Teodora
10 november Martin, Martina
11 november Mårten
12 november Konrad, Kurt
13 november Kristian, Krister
14 november Emil, Emilia
15 november Leopold
16 november Vibeke, Viveka
17 november Naemi, Naima
18 november Lillemor, Moa
19 november Elisabet, Lisbet
20 november Pontus, Marina
21 november Helga, Olga
22 november Cecilia, Sissela
23 november Klemens
24 november Gudrun, Rune
25 november Katarina, Katja
26 november Linus
27 november Astrid, Asta
28 november Malte
29 november Sune
30 november Andreas, Anders
1 december Oskar, Ossian
2 december Beata, Beatrice
3 december Lydia, Cornelia
4 december Barbara, Barbro
5 december Sven
6 december Nikolaus, Niklas
7 december Angela, Angelika
8 december Virginia
9 december Anna
10 december Malin, Malena
11 december Daniel, Daniela
12 december Alexander, Alexis
13 december Lucia
14 december Sten, Sixten
15 december Gottfrid
16 december Assar
17 december Stig
18 december Abraham
19 december Isak
20 december Israel, Moses
21 december Tomas
22 december Natanael, Jonatan
23 december Adam
24 december Eva
26 december Stefan, Staffan
27 december Johannes, Johan
28 december Benjamin
29 december Natalia, Natalie
30 december Abel, Set
31 december Sylvester
`;
const SRC='Wikipedia (svenska namnlängden, CC BY-SA) + Isof';
// parse
const entries=[]; // {name, month, day, text}
for(const line of RAW.split('\n')){
  const m=line.trim().match(/^(\d{1,2})\s+([a-zåäö]+)\s+(.+)$/i);
  if(!m) continue;
  const day=+m[1], month=MONTHS[m[2].toLowerCase()];
  if(!month) continue;
  for(let nm of m[3].split(',')){
    nm=nm.trim();
    if(!nm || nm.startsWith('(')) continue;
    entries.push({name:nm, month, day, text:`${day} ${m[2].toLowerCase()}`});
  }
}
console.log(`Parsade ${entries.length} namn→datum ur listan.`);

const existing=new Map((await q(`select id, lower(canonical) k from name_authority`)).map(r=>[r.k,r.id]));
let upd=0,ins=0;
for(const e of entries){
  const k=e.name.toLowerCase();
  const id=existing.get(k);
  if(id){
    await q(`update name_authority set name_day_month=$2,name_day_day=$3,name_day_text=$4,name_day_source=$5,updated_at=now() where id=$1`,[id,e.month,e.day,e.text,SRC]);
    upd++;
  } else {
    const r=await q(`insert into name_authority (canonical,name_day_month,name_day_day,name_day_text,name_day_source,harvest_sources,swedish_usage_layer) values ($1,$2,$3,$4,$5,array['namnsdag'],'obelagt i våra korpusar') returning id`,[e.name,e.month,e.day,e.text,SRC]);
    existing.set(k,r[0].id); ins++;
  }
}
console.log(`KLART — ${upd} namn fick namnsdag (befintliga), ${ins} nya namn tillagda.`);
console.log('\n=== stickprov ===');
console.log(JSON.stringify(await q(`select canonical,name_day_text,swedish_usage_layer layer from name_authority where lower(canonical) in ('anna','daniel','erik','sven','björn','karl','gustav adolf') order by name_day_month,name_day_day`)));
console.log('total med namnsdag:',JSON.stringify(await q(`select count(*)::int n from name_authority where name_day_text is not null`)));
await c.end();
