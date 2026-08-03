import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Headphones, ExternalLink } from 'lucide-react';

// Kuraterade externa historiepoddar vi tipsar om. Copyright-säkert: vi länkar ut till
// poddens egen sida och skriver EGNA korta faktarader — inga inklistrade avsnittstexter,
// inga omslagsbilder, inget hostat ljud. Tredjepartstips, ingen antydan om samarbete.
interface Pod { name: string; by: string; url: string; sv: string; en: string }

const PODS: Pod[] = [
  {
    name: 'Arkeologi & Historia', by: 'Lena König', url: 'https://lenakonig111.podbean.com',
    sv: 'Besöker fornlämningar och historiska platser i landskapet, ofta med en arkeolog eller expert på plats. 190+ avsnitt — många om platser som finns på vår karta (Birka, Öland, Kalmar, runstenar).',
    en: 'Visits ancient sites and historical places in the landscape, often with an archaeologist on location. 190+ episodes — many about places found on our map (Birka, Öland, Kalmar, runestones).',
  },
  {
    name: 'Historia Nu', by: 'Urban Lindstedt', url: 'https://historia.nu',
    sv: 'Bred svensk och internationell historia på vetenskaplig grund.',
    en: 'Broad Swedish and international history on a scholarly footing.',
  },
  {
    name: 'Harrisons dramatiska historia', by: 'Dick & Katarina Harrison', url: 'https://historia.nu',
    sv: 'Två historiker vägleder genom världshistorien i kronologisk ordning.',
    en: 'Two historians guide you through world history in chronological order.',
  },
  {
    name: 'Militärhistoriepodden', by: 'Martin Hårdstedt & Peter Bennesved', url: 'https://historia.nu',
    sv: 'Militärhistoria från antiken till nutid, med djup ämneskompetens.',
    en: 'Military history from antiquity to the present, with deep subject expertise.',
  },
  {
    name: 'En oväntad historia', by: 'Olle Larsson & Andreas Marklund', url: 'https://historia.nu',
    sv: 'Utgår från en liten händelse för att berätta den stora historien.',
    en: 'Starts from a small event to tell the bigger story.',
  },
  {
    name: 'Vetenskapsradion Historia', by: 'Sveriges Radio', url: 'https://www.sverigesradio.se/vetenskapsradionhistoria',
    sv: 'Sveriges Radios historieprogram — aktuell forskning och historiska nedslag.',
    en: "Swedish Radio's history programme — current research and historical highlights.",
  },
];

export const RecommendedPodcasts: React.FC = () => {
  const { language } = useLanguage();
  const en = language === 'en';
  return (
    <section className="mt-12 pt-8 border-t border-border/60">
      <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
        <Headphones className="h-6 w-6 text-gold" />
        {en ? 'Recommended history podcasts' : 'Rekommenderade historiepoddar'}
      </h2>
      <p className="text-sm text-muted-foreground mb-5">
        {en
          ? 'Third-party podcasts we recommend for the curious. They belong to their respective creators — we simply link out.'
          : 'Externa poddar vi tipsar om för den nyfikne. De tillhör respektive skapare — vi länkar bara ut.'}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {PODS.map((p) => (
          <a key={p.name + p.url} href={p.url} target="_blank" rel="noopener noreferrer"
            className="group rounded-lg border border-border bg-card/60 p-4 hover:bg-card transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-gold">{p.name}</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-gold shrink-0" />
            </div>
            <div className="text-[11px] text-muted-foreground/80 mb-1">{p.by}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{en ? p.en : p.sv}</p>
          </a>
        ))}
      </div>
    </section>
  );
};
