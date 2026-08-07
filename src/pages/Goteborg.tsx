import React from 'react';
import { PlacePage } from '../components/place/PlacePage';

// /sv/goteborg — PILOT för den återanvändbara platssidan. Basen = PlaceMap (place_features_near):
// de LOKALA lagren (fornlämningar, hällristningar, runstenar, mynt, kyrkor) runt Göteborg/Göta älvs
// mynning. Center verifierat mot DB (place_names 'Göteborg', 57.7072/11.9670).
// SKRÄDDARSYTT läggs på HÄR när det är källbelagt: stadens föregångare (Lödöse, Nya Lödöse, Gullberg,
// Älvsborg) via en predecessor_of-relation med VERIFIERADE årtal. Inga påhittade årtal (INGEN GISSNING)
// → föregångar-sektionen byggs först när dateringarna är källkritiskt fastställda.
const Goteborg = () => (
  <PlacePage
    titleSv="Göteborg"
    titleEn="Gothenburg"
    center={{ lat: 57.7072, lng: 11.9670 }}
    zoom={12}
    keywords="Göteborg, Göta älv, fornlämningar, hällristningar, runstenar, Västergötland, arkeologi"
    metaDescriptionSv="Fornlämningar, hällristningar, runstenar, myntfynd och kyrkor kring Göteborg och Göta älvs mynning — på en interaktiv karta."
    metaDescriptionEn="Ancient remains, rock art, runestones, coin finds and churches around Gothenburg and the mouth of the Göta River — on an interactive map."
    introSv={<p>Kartan visar fornlämningar, hällristningar, runstenar, myntfynd och kyrkor i trakten kring Göteborg och Göta älvs mynning. Zooma in och tänd eller släck lager i legenden. Klicka på ett objekt för att se vad det är.</p>}
    introEn={<p>The map shows ancient remains, rock art, runestones, coin finds and churches around Gothenburg and the mouth of the Göta River. Zoom in and toggle layers in the legend. Click an object to see what it is.</p>}
  />
);

export default Goteborg;
