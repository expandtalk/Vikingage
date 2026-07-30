-- Eriksgata-koppling (avstånd node→kungavägslinjen) + Öland som egen maktsfär.
alter table elite_monuments add column if not exists eriksgata_km double precision;
comment on column elite_monuments.eriksgata_km is 'Avstånd (km) från noden till Eriksgatans linje; NULL om ej beräknat. Låga värden = låg på kungens legitimeringsrunda.';
