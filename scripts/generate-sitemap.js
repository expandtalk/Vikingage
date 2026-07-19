import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const routes = [
  { path: '/', priority: 1.0 },
  { path: '/explore', priority: 0.8 },
  // English routes
  { path: '/inscriptions', priority: 0.9 },
  { path: '/carvers', priority: 0.9 },
  { path: '/artefacts', priority: 0.9 },
  { path: '/viking-names', priority: 0.8 },
  { path: '/hundreds', priority: 0.8 },
  { path: '/parishes', priority: 0.8 },
  { path: '/folk-groups', priority: 0.8 },
  { path: '/rivers', priority: 0.8 },
  { path: '/gods', priority: 0.8 },
  { path: '/genetic-events', priority: 0.8 },
  { path: '/royal-chronicles', priority: 0.9 },
  { path: '/fortresses', priority: 0.9 },
  // Swedish routes
  { path: '/sv/runinskrifter', priority: 0.9 },
  { path: '/sv/ristare', priority: 0.9 },
  { path: '/sv/artefakter', priority: 0.9 },
  { path: '/sv/vikinganamn', priority: 0.8 },
  { path: '/sv/harader', priority: 0.8 },
  { path: '/sv/socknar', priority: 0.8 },
  { path: '/sv/folkgrupper', priority: 0.8 },
  { path: '/sv/floder', priority: 0.8 },
  { path: '/sv/gudar', priority: 0.8 },
  { path: '/sv/genetiska-handelser', priority: 0.8 },
  { path: '/sv/kungakronikor', priority: 0.9 },
  { path: '/sv/borgar', priority: 0.9 },
];

const baseUrl = 'https://vikingage.se';

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${routes.map(route => `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

const distPath = path.join(__dirname, '../dist');
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath, { recursive: true });
}

fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemap);
console.log('✅ Sitemap generated successfully!');

