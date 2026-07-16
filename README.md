# Viking Age - Runological Research Platform

A comprehensive platform for runological research and analysis of Scandinavian runic inscriptions. Combines modern web technology with AI-driven analysis (via OpenRouter, Claude Sonnet) to help researchers analyze, date, and understand rune stones from the Viking Age and earlier periods.

## Features

- **Runic Inscriptions Database** - Extensive database with coordinate data, dating, and metadata
- **AI Analysis** - Automatic analysis and dating via OpenRouter (Claude)
- **Interactive Maps** - Visualization of rune stones, fortresses, trade routes, and historical locations
- **Royal Chronicles** - Database of historical kings, dynasties, and sources
- **Genetic Data Integration** - Archaeological genetic data
- **Admin Panel** - Comprehensive data management and import tools
- **Multi-language Support** - Swedish and English

## Tech Stack

### Frontend
- React 18.3.1
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- React Leaflet 4.2.1

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Project ID**: `mnuifmcjspeaauzehasj`
- **Database**: `runic-research-db`

### External Services
- OpenRouter (Claude Sonnet) - AI analysis (server-side edge function)
- Google Maps API - Geocoding and mapping

## Local Development

### Prerequisites
- Node.js and npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Access to Supabase project credentials

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/expandtalk/valhall.git
   cd valhall
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure API credentials**

   Open `.env` and fill in the variables:

   - **Supabase credentials** - Contact the project administrator or:
     - Request access to the Supabase project at https://supabase.com/dashboard
     - Once granted access, go to **Settings → API** to get your credentials

   - **OpenRouter API key** - Set as a Supabase secret (server-side), not in `.env`:
     `supabase secrets set OPENROUTER_API_KEY=sk-or-...`

   - **Google Maps API key** (optional) - Get from https://console.cloud.google.com/

   **Important**: Never commit `.env` to version control - it's in `.gitignore` for security

5. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## Security Notes

- Environment variables in `.env` are **not tracked** by git (protected in `.gitignore`)
- The `.env.example` file shows which variables are needed but contains no sensitive data
- Never share API keys or database credentials publicly
- Always use environment variables for sensitive data

## Database Schema

The database includes tables for:
- Runic inscriptions
- Geographic data (parishes, hundreds, folk groups, cities, fortresses)
- Historical data (kings, dynasties, sources)
- Genetic data (individuals, markers, populations)
- Religious sites (monasteries, churches, bishoprics)
- Trade routes and goods
- Artifacts and carvers

See `CLAUDE.md` for detailed database documentation.

## Deployment

The application can be deployed as a static site or with a Node.js server. The Vite build output is suitable for any static hosting service.

## Contributing

When contributing:
1. Create a new branch for your feature
2. Make your changes
3. Commit with clear, descriptive messages
4. Push to your branch
5. Create a pull request

## Project Structure

```
valhall/
├── src/
│   ├── components/        # React components
│   ├── pages/             # Page routes
│   ├── services/          # External services (aiService, Maps)
│   ├── types/             # TypeScript types
│   └── utils/             # Helper functions
├── supabase/
│   ├── migrations/        # Database migrations
│   └── functions/         # Edge Functions
├── public/                # Static assets
└── README.md              # This file
```

## Support & Documentation

- Full project documentation: see `CLAUDE.md`
- Supabase Dashboard: https://supabase.com/dashboard/project/mnuifmcjspeaauzehasj
- Questions or issues: Create a GitHub issue or contact the project administrator
