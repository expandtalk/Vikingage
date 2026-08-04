-- church_form på ecclesiastical_sites + tagga Sveriges 8 bevarade medeltida rundkyrkor.
-- Källa: sv.wikipedia (Rundkyrka), DigitaltMuseum/Kalmar läns museum. De åtta: Bromma, Solna, Munsö
-- (Uppland), Hagby, Voxtorp (Kalmar/Småland), Vårdsberg (Ög), Skörstorp (Vg), Valleberga (Skåne).
-- Ger snabbval "Rundkyrkor" på /sv/kyrkor + kopplar till Bornholm/Skåne-influens (Lunds ärkestift).

ALTER TABLE ecclesiastical_sites ADD COLUMN IF NOT EXISTS church_form text;

UPDATE ecclesiastical_sites SET church_form='rundkyrka'
WHERE id IN (
  'b3408a98-c38c-4a10-a91d-2ee56ac00b57', -- Vårdsbergs kyrka (Ög)
  '9fe3e3c3-8746-42f9-a6a1-d07e62700042', -- Valleberga kyrka (Skåne)
  '0e194aec-9291-4805-b796-5521505c6841', -- Hagby kyrka (Småland/Möre)
  'd96c1823-cbba-4c39-a205-a404ee23ab8a', -- Voxtorps kyrka (Möre)
  'f7173019-60bd-4787-9a89-e1b99ea94841', -- Bromma kyrka (Uppland)
  'b4056946-7261-4dea-85bd-f4e1a7903056', -- Munsö kyrka (Uppland)
  '95093402-25dc-4a42-a9b6-9a15e3709691', -- Solna kyrka (Uppland)
  'd1ff8163-fa59-43b5-bf05-23db2893d7e2'  -- Skörstorps kyrka (Vg)
);
