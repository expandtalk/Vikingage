import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { PageMeta } from '@/components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCharterDetail } from '@/hooks/useMedievalCharters';
import { CharterAttribution } from '@/components/medeltidsbrev/CharterAttribution';

const MedievalCharterDetail: React.FC = () => {
  const sv = useLanguage().language === 'sv';
  const { sdhk } = useParams();
  const id = Number(sdhk);
  const { data, isLoading } = useCharterDetail(Number.isFinite(id) ? id : null);
  const base = sv ? '/sv/medeltidsbrev' : '/en/medieval-charters';
  const raa = `https://sok.riksarkivet.se/sdhk?SDHK=${id}`;

  const t = sv
    ? { back: '← Alla medeltidsbrev', notFound: 'Brevet hittades inte.', regest: 'Regest', full: 'Brevtext (edition)',
        noFull: 'Endast regest — full brevtext finns inte hos oss. Se tryckt edition:', refs: 'Referenser',
        raa: 'Visa på Riksarkivet (SDHK)', date: 'Datum', place: 'Utfärdandeort', lang: 'Språk', author: 'Utfärdare' }
    : { back: '← All charters', notFound: 'Charter not found.', regest: 'Abstract', full: 'Letter text (edition)',
        noFull: 'Abstract only — we do not hold the full text. See printed edition:', refs: 'References',
        raa: 'View at Riksarkivet (SDHK)', date: 'Date', place: 'Issued at', lang: 'Language', author: 'Issuer' };

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title={`SDHK ${id} — Medeltidsbrev`}
        titleEn={`SDHK ${id} — Medieval charter`}
        description={data?.summary?.slice(0, 160) ?? 'Medeltidsbrev ur SDHK.'}
        descriptionEn={data?.summary?.slice(0, 160) ?? 'Medieval charter from SDHK.'}
      />
      <Header />
      <div className="container mx-auto max-w-3xl px-4 py-6 space-y-5">
        <Link to={base} className="text-sm text-slate-400 hover:text-white">{t.back}</Link>
        {isLoading ? (
          <p className="text-slate-400">…</p>
        ) : !data ? (
          <p className="text-slate-300">{t.notFound}</p>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white">SDHK {data.sdhk_id}</h1>
            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-slate-500">{t.date}</dt><dd className="text-slate-200">{data.date_raw || '—'} {data.year ? `(${data.year})` : ''}</dd>
              <dt className="text-slate-500">{t.place}</dt><dd className="text-slate-200">{data.place_raw || '—'}</dd>
              <dt className="text-slate-500">{t.lang}</dt><dd className="text-slate-200">{data.lang_raw || '—'}</dd>
              <dt className="text-slate-500">{t.author}</dt><dd className="text-slate-200">{data.author_raw || '—'}</dd>
            </dl>

            <section>
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">{t.regest}</h2>
              <p className="whitespace-pre-wrap leading-relaxed text-slate-100">{data.summary}</p>
            </section>

            <section>
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">{t.full}</h2>
              {data.edition_text && data.edition_text.trim() ? (
                <p className="whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-sm leading-relaxed text-slate-200">{data.edition_text}</p>
              ) : (
                <p className="text-sm text-slate-400">{t.noFull} {data.print_ref || '—'}</p>
              )}
            </section>

            {(data.print_ref || data.translation_ref || data.seals || data.original_ref) && (
              <section className="text-sm text-slate-400">
                <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">{t.refs}</h2>
                <ul className="space-y-0.5">
                  {data.original_ref && <li>Original: {data.original_ref}</li>}
                  {data.print_ref && <li>{sv ? 'Tryck' : 'Print'}: {data.print_ref}</li>}
                  {data.translation_ref && <li>{sv ? 'Översättning' : 'Translation'}: {data.translation_ref}</li>}
                  {data.seals && <li>{sv ? 'Sigill' : 'Seals'}: {data.seals}</li>}
                </ul>
              </section>
            )}

            <a href={raa} target="_blank" rel="noopener noreferrer"
               className="inline-block rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:border-[hsl(var(--gold))]">
              {t.raa}
            </a>
            <CharterAttribution />
          </>
        )}
      </div>
    </div>
  );
};

export default MedievalCharterDetail;
