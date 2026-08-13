import React from 'react';
import { Helmet } from 'react-helmet-async';
import { buildEntityJsonLd, type EntitySchemaInput } from '@/utils/seo/entitySchema';

// Emitterar schema.org JSON-LD (belagda fakta) för EN entitet i <head> via Helmet, så AI-sök och
// crawlers kan läsa vår kunskapsgraf strukturerat — sameAs → Wikidata/RAÄ ur external_ids.
// Använd på entitets-/plats-/hubbsidor bredvid <PageMeta>. INGEN GISSNING (se entitySchema.ts).
export const EntityJsonLd: React.FC<EntitySchemaInput> = (props) => {
  if (!props.name || !props.path) return null;
  const json = buildEntityJsonLd(props);
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(json)}</script>
    </Helmet>
  );
};

export default EntityJsonLd;
