// Konsoliderad: useMediaQuery.ts är sanningskällan för brytpunkter (mobil ≤ 768 px).
// Denna fil behålls bara som tunn re-export så äldre importer (t.ex. ui/sidebar) fortsätter fungera.
export { useIsMobile } from '@/hooks/useMediaQuery';
