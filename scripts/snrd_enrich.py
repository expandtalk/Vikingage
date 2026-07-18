#!/usr/bin/env python3
"""
snrd_enrich.py — Berika runic_inscriptions med SVENSKA översättningar (och
normaliseringar) från Riksantikvarieämbetets Runor/SNRD-API.

Efter rundata-crosswalken saknar ~2660 stenar svensk översättning (rundata 2021
hade mest engelska). SNRD 2020 har svenska för de flesta svenska stenar. Skriptet
läser en signum-lista, slår upp varje mot SNRD, VERIFIERAR exakt signum-match mot
signum1/signum2/alternative_signa (så prefixsök inte ger falska träffar), hämtar
detaljposten och plockar svensk översättning + normalisering. Emitterar UPDATE-SQL
som fyller translation_sv/normalization DÄR de saknas.

Bygger på bautil_lookup.py — ren stdlib, rate-limitat (0.4 s mellan anrop).

INDATA: en fil med ett signum per rad (eller en JSON-array). Generera den ur DB:n:
    -- SQL-editorn -> exportera kolumnen till scripts/data/snrd-missing-sv.txt
    select signum from public.runic_inscriptions
    where (translation_sv is null or translation_sv = '') and signum is not null
    order by signum;

ANVÄNDNING:
    python3 snrd_enrich.py scripts/data/snrd-missing-sv.txt \
        -o scripts/data/snrd-sv-enrich.sql -r scripts/data/snrd-sv-report.md [--limit N]

Kör sedan scripts/data/snrd-sv-enrich.sql i SQL-editorn.
"""

import argparse
import json
import sys
import time
import urllib.parse
import urllib.request

API_BASE = "https://runor.raa.se/api/snrd"
EDITION = "2020"
USER_AGENT = "vikingage-snrd-enrich/1.0 (runologisk forskning)"
PAUSE_S = 0.4


def api_get(path: str, params: dict):
    qs = urllib.parse.urlencode(params)
    url = f"{API_BASE}/{path}?{qs}"
    req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def normalize_signum(s: str) -> str:
    return " ".join(s.split()).strip()


def read_signums(path: str) -> list:
    with open(path, encoding="utf-8") as f:
        raw = f.read().strip()
    if raw.startswith("["):
        return [normalize_signum(str(s)) for s in json.loads(raw) if str(s).strip()]
    # en per rad; hoppa ev. header/citat/kommatecken
    out = []
    for line in raw.splitlines():
        s = line.strip().strip('",').strip()
        if not s or s.lower() == "signum":
            continue
        out.append(normalize_signum(s))
    return out


def search_signum(signum: str) -> list:
    try:
        return api_get("search", {"edition_id": EDITION, "search_field": "SIGNUM", "matching_text": signum})
    except Exception as e:
        print(f"  ! sökfel {signum}: {e}", file=sys.stderr)
        return []


def fetch_inscription(uuid: str):
    try:
        return api_get(f"inscriptions/{uuid}", {"edition_id": EDITION})
    except Exception as e:
        print(f"  ! detaljfel {uuid}: {e}", file=sys.stderr)
        return None


def exact_match(signum: str, hits: list):
    """Returnera FÖRSTA detaljpost vars signum1/signum2/alternative_signa matchar exakt."""
    target = normalize_signum(signum).lower()
    for hit in hits:
        uuid = hit.get("inscription_id")
        if not uuid:
            continue
        time.sleep(PAUSE_S)
        d = fetch_inscription(uuid)
        if not d:
            continue
        candidates = []
        s1, s2 = d.get("signum1"), d.get("signum2")
        if s1 or s2:
            candidates.append(normalize_signum(f"{s1 or ''} {s2 or ''}"))
        candidates += [normalize_signum(a) for a in (d.get("alternative_signa") or [])]
        if any(c.lower() == target for c in candidates):
            return d
    return None


def extract_sv_and_norm(detail: dict):
    """Plocka svensk översättning + normalisering (best-effort över fältnamn)."""
    sv = None
    norm = None
    for rt in detail.get("runic_texts") or []:
        # översättning: translations[].translation där språk = svenska
        for tr in rt.get("translations") or []:
            lang = tr.get("language") or {}
            code = (lang.get("language_code") if isinstance(lang, dict) else lang) or ""
            sv_name = (lang.get("sv") if isinstance(lang, dict) else "") or ""
            is_sv = str(code).lower().startswith("sv") or "svensk" in str(sv_name).lower()
            if is_sv and tr.get("translation") and not sv:
                sv = tr["translation"]
        # normalisering: SNRD kallar den 'interpretations' (fornnordisk normalform)
        for ip in rt.get("interpretations") or []:
            if not norm and ip.get("text"):
                norm = ip["text"]
                break
    return sv, norm


def main() -> int:
    ap = argparse.ArgumentParser(description="Berika translation_sv/normalization från SNRD")
    ap.add_argument("input", help="Signum-lista (en per rad eller JSON-array)")
    ap.add_argument("-o", "--output", default="scripts/data/snrd-sv-enrich.sql")
    ap.add_argument("-r", "--report", default="scripts/data/snrd-sv-report.md")
    ap.add_argument("--limit", type=int, default=0, help="Begränsa antal signum (0 = alla)")
    args = ap.parse_args()

    signums = read_signums(args.input)
    if args.limit:
        signums = signums[: args.limit]
    print(f"Berikar {len(signums)} signum mot SNRD {EDITION} …")

    sv_rows = []   # (signum, sv)
    norm_rows = []  # (signum, norm)
    stats = {"sv": 0, "norm": 0, "not_found": 0}

    for i, sig in enumerate(signums, 1):
        if i % 50 == 0:
            print(f"  [{i}/{len(signums)}] sv={stats['sv']} norm={stats['norm']} saknas={stats['not_found']}", flush=True)
        time.sleep(PAUSE_S)
        d = exact_match(sig, search_signum(sig))
        if not d:
            stats["not_found"] += 1
            continue
        sv, norm = extract_sv_and_norm(d)
        if sv:
            sv_rows.append((sig, sv)); stats["sv"] += 1
        if norm:
            norm_rows.append((sig, norm)); stats["norm"] += 1

    esc = lambda s: "'" + s.replace("'", "''") + "'"

    def update_block(col, rows):
        if not rows:
            return f"-- (inga {col}-träffar)\n"
        vals = ",\n".join(f"({esc(s)},{esc(t)})" for s, t in rows)
        return (
            f"update public.runic_inscriptions ri\n"
            f"set {col} = cw.val\n"
            f"from (values\n{vals}\n) as cw(signum, val)\n"
            f"where lower(regexp_replace(ri.signum,'\\s+',' ','g')) = "
            f"lower(regexp_replace(cw.signum::text,'\\s+',' ','g'))\n"
            f"  and (ri.{col} is null or ri.{col} = '');\n\n"
        )

    with open(args.output, "w", encoding="utf-8") as f:
        f.write(f"-- SNRD-berikning ({EDITION}). {stats['sv']} sv-översättningar, {stats['norm']} normaliseringar.\n")
        f.write("-- Fyller runic_inscriptions.translation_sv/normalization där de saknas. Kör i editorn.\n\n")
        f.write(update_block("translation_sv", sv_rows))
        f.write(update_block("normalization", norm_rows))

    with open(args.report, "w", encoding="utf-8") as f:
        f.write(f"# SNRD-berikningsrapport (edition {EDITION})\n\n")
        f.write(f"- Signum in: {len(signums)}\n- Svenska översättningar: {stats['sv']}\n")
        f.write(f"- Normaliseringar: {stats['norm']}\n- Ej funna i SNRD: {stats['not_found']}\n")

    print(f"\nKlart. {stats}\nSQL: {args.output}\nRapport: {args.report}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
