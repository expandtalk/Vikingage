import { createRoot } from 'react-dom/client'
import L from 'leaflet'
import App from './App.tsx'
import './index.css'

// leaflet.markercluster (UMD) refererar globala `L` vid modul-eval. I den bundlade koden finns
// ingen global L → "ReferenceError: L is not defined" som blankade t.ex. /sv/borgar. Sätt global L
// i entryn INNAN någon lazy-chunk laddar pluginet.
(window as unknown as { L: typeof L }).L = L;

createRoot(document.getElementById("root")!).render(<App />);
