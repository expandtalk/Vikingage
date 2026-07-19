# Viking Age - Runologisk Forskningsplattform

## Projektöversikt

Viking Age är en omfattande plattform för runologisk forskning och analys av skandinaviska runinskrifter. Plattformen kombinerar modern webbteknologi med AI-driven analys (via OpenRouter, modell Claude Sonnet) för att hjälpa forskare att analysera, datera och förstå runinskrifter från vikingatiden och tidigare perioder.

### Huvudfunktioner

- **Runinskrifter**: Omfattande databas med runinskrifter, inklusive koordinater, dateringar, och metadata
- **AI-analys**: Automatisk analys och datering av runinskrifter via OpenRouter (Claude)
- **Interaktiva kartor**: Visualisering av runinskrifter, forten, handelsvägar och historiska platser
- **Kungakrönikor**: Databas över historiska kungar, dynastier och källor
- **Genetisk data**: Integration av genetisk data från arkeologiska fynd
- **Administratörspanel**: Omfattande verktyg för datahantering och import
- **Flera språk**: Stöd för svenska och engelska

## Teknisk Stack

### Frontend
- **React 18.3.1** - UI-bibliotek
- **TypeScript** - Typad JavaScript
- **Vite** - Build tool och dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI-komponenter (Radix UI)
- **React Router** - Routing
- **TanStack Query** - Data fetching och caching
- **React Leaflet 4.2.1** - Interaktiva kartor
- **Leaflet** - Kartbibliotek

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL-databas
  - Authentication
  - Row Level Security (RLS)
  - Edge Functions
- **Project ID**: `mnuifmcjspeaauzehasj`
- **Database**: `runic-research-db`
- **URL**: https://supabase.com/dashboard/project/mnuifmcjspeaauzehasj

### Externa Tjänster
- **OpenRouter (Claude Sonnet)** - AI-analys av runinskrifter (server-side via edge function)
- **Google Maps API** - Geokodning och karttjänster

## Databasstruktur

### Huvudtabeller

#### Runinskrifter
- `runic_inscriptions` - Huvudtabell för runinskrifter
  - Innehåller: signum, translitteration, koordinater, datering, objekttyp, etc.
  - Länkar till: parishes, carvers, artefacts

#### Geografiska Data
- `parishes` - Svenska socknar
- `hundreds` - Härader
- `folk_groups` - Folkgrupper
- `viking_cities` - Vikingatida städer
- `viking_fortresses` - Vikingatida forten
- `swedish_hillforts` - Fornborgar

#### Personer & Mästare
- `carvers` - Runristare/mästare
- `viking_names` - Vikingatida namn

#### Historiska Data
- `royal_dynasties` - Kungadynastier
- `historical_kings` - Historiska kungar
- `historical_sources` - Historiska källor
- `royal_chronicles` - Kungakrönikor
- `king_inscription_links` - Länkar mellan kungar och inskrifter

#### Genetisk Data
- `archaeological_sites` - Arkeologiska platser
- `genetic_individuals` - Individer med genetisk data
- `genetic_markers` - Genetiska markörer
- `admixture_analysis` - ADMIXTURE-analysresultat
- `qp adm_analysis` - qpAdm-analysresultat
- `reference_populations` - Referenspopulationer
- `historical_periods` - Historiska perioder

#### Kristna Platser
- `christian_sites` - Kloster, kyrkor och andra kristna platser
  - Typer: monastery, church, holy_place, bishopric, hospital
  - Ordens: cistercian, benedictine, franciscan, dominican, birgittine, etc.

#### Vägar & Transport
- `viking_roads` - Vikingatida vägar
  - Typer: rullstensås, halväg, vinterväg, bro, vadställe, knutpunkt
- `road_waypoints` - Vägsegment och waypoints
- `road_landmarks` - Landmärken längs vägarna

#### Artefakter
- `artefacts` - Arkeologiska artefakter kopplade till inskrifter

#### Handelsdata
- `trade_routes` - Handelsvägar
- `trade_cities` - Handelsstäder
- `trade_goods` - Handelsvaror

### Säkerhet & Rättigheter

- **Row Level Security (RLS)** - Aktiverat på alla tabeller
- **Policies**:
  - Publik läsning för de flesta tabeller
  - Admin-rättigheter för skrivning/uppdatering/radering
  - Funktion: `has_role(user_id, 'admin')` för rollkontroll
  - Funktion: `is_admin()` för admin-kontroll

### Migrationsfiler

Alla databasändringar hanteras via migrationsfiler i `supabase/migrations/`. Det finns över 250 migrationsfiler som dokumenterar databasens utveckling över tid.

## Projektstruktur

```
vikingage/
├── src/
│   ├── components/          # React-komponenter
│   │   ├── admin/          # Admin-paneler och verktyg
│   │   ├── carvers/        # Runristare-komponenter
│   │   ├── chronicles/     # Kungakrönikor
│   │   ├── explorer/       # Dataexplorer
│   │   ├── filters/        # Filterkomponenter
│   │   ├── genetic/        # Genetisk data
│   │   ├── import/         # Dataimportverktyg
│   │   ├── map/            # Kartkomponenter
│   │   ├── search/         # Sökfunktionalitet
│   │   └── ui/             # UI-komponenter (shadcn)
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Sidor/routes
│   ├── services/           # Externa tjänster (aiService, Maps)
│   ├── types/              # TypeScript-typer
│   ├── utils/              # Hjälpfunktioner
│   └── integrations/       # Supabase-integration
│       └── supabase/
│           ├── client.ts   # Supabase client
│           └── types.ts    # Genererade databas-typer
├── supabase/
│   ├── migrations/         # Databasmigrationsfiler
│   ├── functions/           # Edge Functions
│   └── config.toml         # Supabase-konfiguration
└── public/                 # Statiska filer
```

## Viktiga Routes

- `/` - Startsida
- `/welcome` - Välkomstsida med statistik
- `/explore` - Dataexplorer
- `/artefacts` - Artefakter
- `/fortresses` - Vikingatida forten
- `/carvers` - Runristare
- `/royal-chronicles` - Kungakrönikor
- `/prices` - Priser (troligen för API-användning)
- `/auth` - Autentisering
- `/admin` - Administratörspanel
- `/profile` - Användarprofil

## AI-integration

### AI-tjänst (OpenRouter)
- **Klient**: `src/services/aiService.ts` (anropar edge function, ingen nyckel i klienten)
- **Edge Function**: `analyze-runic` (kallar OpenRouter, modell `anthropic/claude-sonnet-4-5`)
- **Nyckel**: `OPENROUTER_API_KEY` som Supabase-secret (server-side, exponeras aldrig i browsern)
- **Funktion**: Analyserar runinskrifter och ger:
  - Datering
  - Språklig analys
  - Historisk kontext
  - Tolkning

## Dataimport

Projektet har omfattande importverktyg för:
- CSV-import av runinskrifter
- Bulk-import av data
- Koordinatfixning
- Dataverifiering

## Miljövariabler

För att köra projektet lokalt behövs:
- Supabase URL och keys (via `.env`, med fallback i `client.ts`)
- `OPENROUTER_API_KEY` som Supabase-secret (för AI-analys, server-side)
- Google Maps API key (för geokodning, valfritt)

## Utveckling

### Installera dependencies
```bash
npm install
```

### Starta dev server
```bash
npm run dev
```

### Build för produktion
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Databasanslutning

Supabase-projektet är konfigurerat med:
- **Project ID**: `mnuifmcjspeaauzehasj`
- **URL**: `https://mnuifmcjspeaauzehasj.supabase.co`
- **Database**: `runic-research-db`

För att komma åt databasen:
1. Gå till https://supabase.com/dashboard/project/mnuifmcjspeaauzehasj
2. Använd Supabase Dashboard för att hantera data
3. Edge Functions finns i `supabase/functions/`

## Viktiga Filer

- `package.json` - Projektberoenden
- `vite.config.ts` - Vite-konfiguration
- `tailwind.config.ts` - Tailwind CSS-konfiguration
- `tsconfig.json` - TypeScript-konfiguration
- `supabase/config.toml` - Supabase CLI-konfiguration

## Noteringar

- Projektet använder React 18.3.1 (inte React 19)
- `react-leaflet` är nedgraderad till 4.2.1 för kompatibilitet med React 18
- Projektet har stöd för flerspråkighet (svenska/engelska)
- Alla tabeller har `created_at` och `updated_at` timestamps
- RLS-policies säkerställer att endast admins kan modifiera data

## Teamarbete & Collaboration

### Git Workflow

1. **Branching**
   - `main` - Produktionsred kod
   - `develop` - Utvecklingsversion
   - Feature branches: `feature/description` - För nya features
   - Bugfix branches: `fix/description` - För bugfixar

2. **Commits**
   - Använd tydliga, beskrivande commit-meddelanden
   - Format: `[type]: description` (t.ex. `feat: add map filtering`, `fix: resolve database connection issue`)
   - En commit = en logisk ändring

3. **Pull Requests**
   - Skapa PR för alla ändringar till `main` eller `develop`
   - Inklusive beskrivning av vad som ändras och varför
   - Minst 1 reviewer före merge

### Supabase Access för Teammedlemmar

**För nya bidragsgivare:**

1. Kontakta projektadministratören för att få tillgång till Supabase-projektet
2. Du får en inbjudan till Supabase-organisationen
3. Acceptera inbjudan och logga in på dashboard
4. Gå till **Settings → API** för att få dina credentials
5. Fyll i `.env`-filen med dina credentials (DELA ALDRIG .env-filen)

**Roller i Supabase:**
- **Viewer** - Kan endast läsa data
- **Developer** - Kan läsa, skriva och köra migrations
- **Owner** - Full tillgång (normalt bara projektledare)

### Database Migrations

**Viktigt**: Alla databasändringar måste hanteras via migrations, aldrig direkta ändringar i dashboard.

**Skapa en ny migration:**
```bash
supabase migration new [descriptive_name]
```

**Tillämpa migrations lokalt:**
```bash
supabase db push
```

**Innan du pushar en migration:**
1. Testa den lokalt: `supabase db push`
2. Verifiera att inga befintliga data går förlorad
3. Committa migrationen tillsammans med motsvarande TypeScript-ändringar
4. Push och skapa PR
5. Andra bidragsgivare kör `supabase db push` efter de pullar din kod

**Migrationsfiler:**
- Lagras i `supabase/migrations/`
- Filnamnen är automatiskt genererade med timestamp
- Innehål: SQL-satser för schema-ändringar

## Säkerhet & Miljövariabler

### Environment Variables (.env)

**Viktigt**: Aldrig committa `.env`-filen!

Projektet använder följande variabler:
- `VITE_SUPABASE_PROJECT_ID` - Supabase project ID
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Anon/publicerbar nyckel
- `VITE_SUPABASE_URL` - Supabase API URL
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API (optional)
- `OPENROUTER_API_KEY` - sätts som Supabase-secret (server-side), inte som VITE-variabel

Se `.env.example` för mall.

### Säkerhetsriktlinjer

1. **Aldrig dela API-nycklar**
   - Distribueras inte via GitHub, Slack, email
   - Delade genom Supabase dashboard access
   - Google API-nycklar begränsas per domän

2. **Row Level Security (RLS)**
   - Aktiverat på alla databastabeller
   - Publik läsning för de flesta tabeller
   - Endast admins kan skriva/uppdatera/radera
   - Verifiera RLS-policies innan databasändringar

3. **API-nyckelrotation**
   - Om en nyckel exponeras, regenereras den omedelbar
   - Gamla nycklar blir invalid
   - Uppdatera alla miljöer med ny nyckel

## Framtida Utveckling

- Fortsatt integration av genetisk data
- Utökad AI-analysfunktionalitet
- Ytterligare historiska datakällor
- Förbättrad kartvisualisering
- Exportfunktioner för forskningsdata


