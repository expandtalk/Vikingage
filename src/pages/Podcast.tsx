import React, { Suspense, lazy } from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';

// /podcast — egen sida för podcasten (flyttad från startsidan). Ljudberättelser om vikingatiden.
const PodcastPromotion = lazy(() =>
  import('../components/welcome/PodcastPromotion').then((m) => ({ default: m.PodcastPromotion })));
const RecommendedPodcasts = lazy(() =>
  import('../components/podcast/RecommendedPodcasts').then((m) => ({ default: m.RecommendedPodcasts })));

const Podcast = () => (
  <div className="min-h-screen viking-bg">
    <PageMeta
      title="Podcast — ljudberättelser från vikingatiden"
      titleEn="Podcast — audio stories from the Viking Age"
      description="Lyssna på Viking Ages podcast: berättelser om runstenar, sagor och myter från Nordens guldålder."
      descriptionEn="Listen to the Viking Age podcast: stories about runestones, sagas and myths from the golden age of the North."
      keywords="podcast, vikingatid, runstenar, sagor, myter, ljudberättelser"
    />
    <Header />
    <Breadcrumbs />
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Rekommenderade poddar FÖRE de egna (Daniel). */}
      <Suspense fallback={<div className="h-32 animate-pulse bg-white/10 rounded-lg" />}>
        <RecommendedPodcasts />
      </Suspense>
      <Suspense fallback={null}>
        <PodcastPromotion />
      </Suspense>
    </main>
    <Footer />
  </div>
);

export default Podcast;
