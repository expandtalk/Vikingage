import { createRoot } from 'react-dom/client'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'  // GLOBALT: annars saknar sök-overläggets karta (AnswerContext) sin
                                    // CSS på sidor som inte redan laddat en kartkomponent → mörk ruta.
import App from './App.tsx'
// Self-hostat typsnitt (Crimson Text) via Fontsource → ingen tredjeparts-laddning från Google
// (fonts.googleapis.com skickade besökarens IP till Google). Samma familjenamn 'Crimson Text'.
import '@fontsource/crimson-text/400.css'
import '@fontsource/crimson-text/600.css'
import '@fontsource/crimson-text/700.css'
import './index.css'

// leaflet.markercluster (UMD) refererar globala `L` vid modul-eval. I den bundlade koden finns
// ingen global L → "ReferenceError: L is not defined" som blankade t.ex. /sv/borgar. Sätt global L
// i entryn INNAN någon lazy-chunk laddar pluginet.
(window as unknown as { L: typeof L }).L = L;

// leaflet-rotate: patchar L.Map med setBearing()/getBearing() för "heading-up" (kartan roteras
// så färdriktningen pekar upp i billäge → botar sjösjukan vid färd söderut). Måste laddas EFTER
// global L. Vid bäring 0 (allt utom aktivt bil-följe) beter sig kartan som vanlig Leaflet.
import 'leaflet-rotate';

createRoot(document.getElementById("root")!).render(<App />);
