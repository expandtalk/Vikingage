
// Runbleck/amuletter — klientspegling av DB-predikatet is_runbleck (migration 20260728210000).
export const isRunbleckType = (objectType?: string | null): boolean =>
  !!objectType && /bleck|amulet/i.test(objectType);

export const filterInscriptionsByLegend = (
  inscriptions: any[],
  enabledLegendItems: { [key: string]: boolean },
  isVikingMode: boolean,
  selectedTimePeriod?: string
): any[] => {
  console.log(`🔍 FILTER: Processing ${inscriptions.length} inscriptions`);
  console.log('📊 Legend items status:', {
    runicInscriptionsEnabled: enabledLegendItems.runic_inscriptions,
    foreignInscriptionsEnabled: enabledLegendItems.foreign_inscriptions,
    totalEnabledItems: Object.values(enabledLegendItems).filter(Boolean).length
  });

  // Separera svenska och utländska runstenar
  const swedishInscriptions = inscriptions.filter(i => 
    !i.country || 
    i.country.toLowerCase().includes('sverige') || 
    i.country.toLowerCase().includes('sweden') ||
    i.country.toLowerCase() === 'sweden'
  );
  
  const foreignInscriptions = inscriptions.filter(i => 
    i.country && 
    !i.country.toLowerCase().includes('sverige') && 
    !i.country.toLowerCase().includes('sweden') &&
    i.country.toLowerCase() !== 'sweden'
  );

  let result: any[] = [];

  // Lägg till svenska runstenar om enabled
  if (enabledLegendItems.runic_inscriptions !== false) {
    console.log(`✅ Swedish inscriptions enabled - adding ${swedishInscriptions.length} inscriptions`);
    result = [...result, ...swedishInscriptions];
  }

  // Lägg till utländska runstenar om enabled
  if (enabledLegendItems.foreign_inscriptions !== false) {
    console.log(`🌍 Foreign inscriptions enabled - adding ${foreignInscriptions.length} inscriptions`);
    result = [...result, ...foreignInscriptions];
  }
  
  console.log(`📊 Final result: ${result.length} inscriptions (Swedish: ${enabledLegendItems.runic_inscriptions !== false ? swedishInscriptions.length : 0}, Foreign: ${enabledLegendItems.foreign_inscriptions !== false ? foreignInscriptions.length : 0})`);

  // Runbleck-filter (fristående, opt-in, AV som standard): begränsa till runbleck/amuletter.
  if (enabledLegendItems.runbleck_only) {
    result = result.filter((i) => isRunbleckType(i.object_type ?? i.objectType ?? i.objecttype));
  }

  return result;
};
