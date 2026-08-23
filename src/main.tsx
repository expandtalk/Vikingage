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

// DEPLOY-SJÄLVLÄKNING: när en lazy-chunk inte kan hämtas (ny dist mitt i besök → gammal index.html
// pekar på utbytt/ännu-ej-uppladdad chunk, och .htaccess soft-404:ar saknad fil → index.html → parsefel:
// "Failed to fetch dynamically imported module"), ladda om EN gång för färsk index.html + chunkar.
// 10 s-guard hindrar omladdningsloop om felet är äkta (då bubblar felet upp i st.f. att loopa).
window.addEventListener('vite:preloadError', () => {
  const KEY = 'vg-preload-reload';
  const last = Number(sessionStorage.getItem(KEY) || 0);
  if (Date.now() - last > 10000) {
    sessionStorage.setItem(KEY, String(Date.now()));
    window.location.reload();
  }
});

// OBS: leaflet-rotate BORTTAGET. Det patchade canvas-renderarens mus→kartkoordinat-matematik och
// bröt klick-/popup-träffdetektering på canvas-markörer (preferCanvas) även vid bäring 0 — Daniels
// "klick på kartmarkörer gjorde inget". Heading-up är ändå avstängt, så importen fyllde ingen funktion.
// Återinförs FÖRST tillsammans med en fix för canvas-hit-detection när rotation ska på igen.

createRoot(document.getElementById("root")!).render(<App />);
