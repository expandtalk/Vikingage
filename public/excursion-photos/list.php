<?php
// Katalog-listare för /excursion-photos/. Skannar sina EGNA undermappar och returnerar
// {"<mapp>": ["fil1.jpg", ...]} — samma form som manifest.json. Så slipper vi hand-underhålla
// manifestet: kör scripts/data/sync-manifest.mjs som hämtar detta och skriver manifest.json.
// Säkerhet: inga parametrar, ingen path-traversal — listar bara denna mapps direkta undermappar
// och bara bildfiler. Uteslutna: thumb.* (kort-tumnagel) och undermappen thumbs/.
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$base = __DIR__;
$out = array();
$exts = array('jpg', 'jpeg', 'png', 'webp', 'gif');

foreach (scandir($base) as $dir) {
    if ($dir === '.' || $dir === '..') continue;
    $path = $base . DIRECTORY_SEPARATOR . $dir;
    if (!is_dir($path)) continue;
    $files = array();
    foreach (scandir($path) as $f) {
        if ($f[0] === '.') continue;
        if (is_dir($path . DIRECTORY_SEPARATOR . $f)) continue; // hoppa thumbs/ m.fl.
        if (preg_match('/^thumb\./i', $f)) continue;            // kort-tumnagel, ej ett galleri-foto
        $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
        if (in_array($ext, $exts, true)) $files[] = $f;
    }
    if (count($files) > 0) { sort($files); $out[$dir] = $files; }
}
ksort($out);
echo json_encode($out, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
