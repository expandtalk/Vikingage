import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, Building2, GraduationCap, Globe, Loader2, ExternalLink } from 'lucide-react';

// Publik forskarprofil. Läser researcher_profiles (publik SELECT-policy) via handle.
// Adress finns i researcher_private (owner-only) och hämtas ALDRIG här.
const sb = supabase as any;

interface PublicProfile {
  handle: string; display_name: string | null; avatar_url: string | null; institution: string | null;
  field_of_expertise: string | null; credentials: string | null; bio: string | null;
  website_url: string | null; orcid_id: string | null; social_links: Record<string, string> | null;
}

const ResearcherProfile = () => {
  const { handle } = useParams<{ handle: string }>();
  const { language } = useLanguage();
  const sv = language === 'sv';

  const { data, isLoading } = useQuery({
    queryKey: ['researcher-public', handle],
    enabled: !!handle,
    queryFn: async () => {
      const { data, error } = await sb
        .from('researcher_profiles')
        .select('handle, display_name, avatar_url, institution, field_of_expertise, credentials, bio, website_url, orcid_id, social_links')
        .eq('handle', handle)
        .maybeSingle();
      if (error) throw error;
      return data as PublicProfile | null;
    },
  });

  const name = data?.display_name || handle || '';
  const social = data?.social_links ?? {};
  const links: Array<{ label: string; url: string }> = [];
  if (data?.website_url) links.push({ label: sv ? 'Webbplats' : 'Website', url: data.website_url });
  if (data?.orcid_id) links.push({ label: 'ORCID', url: `https://orcid.org/${data.orcid_id.replace(/^https?:\/\/orcid\.org\//, '')}` });
  for (const [k, label] of [['academia', 'Academia.edu'], ['linkedin', 'LinkedIn'], ['x', 'X / Mastodon']] as const) {
    if (social[k]) links.push({ label, url: social[k] });
  }

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title={name ? `${name} — forskarprofil` : 'Forskarprofil'}
        titleEn={name ? `${name} — researcher profile` : 'Researcher profile'}
        description={data?.bio?.slice(0, 155) || `Forskarprofil på Viking Age.`}
        descriptionEn={data?.bio?.slice(0, 155) || `Researcher profile on Viking Age.`}
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {isLoading ? (
          <div className="flex items-center gap-2 py-20 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />{sv ? 'Laddar…' : 'Loading…'}</div>
        ) : !data ? (
          <div className="rounded-lg border border-border viking-card p-8 text-center">
            <User className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <h1 className="mb-2 text-xl font-semibold text-foreground">{sv ? 'Profilen hittades inte' : 'Profile not found'}</h1>
            <p className="mb-4 text-sm text-muted-foreground">{sv ? 'Det finns ingen publik profil med den adressen.' : 'No public profile at this address.'}</p>
            <Link to="/forskare" className="text-gold hover:underline">{sv ? 'Se alla forskare' : 'Browse researchers'}</Link>
          </div>
        ) : (
          <article>
            <header className="mb-6 flex items-start gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-gold/40 bg-gold/10">
                {data.avatar_url ? (
                  <img src={data.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center"><User className="h-8 w-8 text-gold" /></div>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl font-bold text-foreground">{name}</h1>
                {data.credentials && <p className="text-sm text-gold/90">{data.credentials}</p>}
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {data.institution && <span className="inline-flex items-center gap-1.5"><Building2 className="h-4 w-4" />{data.institution}</span>}
                  {data.field_of_expertise && <span className="inline-flex items-center gap-1.5"><GraduationCap className="h-4 w-4" />{data.field_of_expertise}</span>}
                </div>
              </div>
            </header>

            {data.bio && (
              <section className="mb-6 rounded-lg border border-border viking-card p-5">
                <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">{data.bio}</p>
              </section>
            )}

            {links.length > 0 && (
              <section className="mb-6">
                <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-gold/80"><Globe className="h-4 w-4" />{sv ? 'Länkar' : 'Links'}</h2>
                <ul className="flex flex-wrap gap-2">
                  {links.map((l) => (
                    <li key={l.url}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-sm text-foreground hover:border-gold/50 hover:bg-gold/10">
                        {l.label}<ExternalLink className="h-3.5 w-3.5 opacity-70" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <p className="text-xs text-muted-foreground/70">{sv ? 'Publik forskarprofil på Viking Age. Kontaktuppgifter delas inte publikt.' : 'Public researcher profile on Viking Age. Contact details are not shared publicly.'}</p>
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ResearcherProfile;
