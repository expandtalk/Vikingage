-- Mysinge hög (Resmo, Öland) + Karlevi Öl 1 — berikning ur Daniels källor (Länsstyrelsen Kalmar,
-- Hagberg "Med arkeologen Sverige runt") + Daniels egen observation av Karlevis sekundärinskrift.

update public.heritage_sites set
  period = 'Äldre bronsålder (ca 1800–1500 f.Kr.); gravfältet m. kontinuitet stenålder–järnålder',
  description = 'En av Ölands största gravhögar, på gravfältet mellan Resmo och Mysinge (~42 m i diameter, ~3 m hög). Georadar 2004 påvisade ett stort röse under högen → sannolikt äldre bronsålder (1800–1500 f.Kr.), en överklassgrav. Ingår i ett ca 2 km långt fornlämningsområde med gravar från stenålder, bronsålder och järnålder; strax söder om högen ligger Ölands äldsta gravar — en dös och tre gånggrifter (stenkammargravar, ca 3500 f.Kr., i bruk in på 1000 f.Kr.). Sägen: sjökungen "kung Mysing" ska ha bott i högen (vagn dragen av fyra snövita hästar), och tidigt 1900-tal omvittnades spökerier. Vidsträckt utsikt över Stora Alvaret, Mörbylångadalen och Kalmarsund. Norrut ligger Gynge hög med en treudd. Källor: Länsstyrelsen Kalmar län; Ulf Erik Hagberg, Med arkeologen Sverige runt.'
 where name ilike '%mysinge hög%' and parish ilike 'resmo%';

update public.runic_inscriptions set
  scholarly_notes = coalesce(scholarly_notes,'') ||
    ' Sekundärinskrift: under runinskriften finns en kort, senare (trolig medeltida) inskrift med okänd innebörd, läst som "(NINONI+ EH +)" — möjligen "i Jesu namn". Den är i avvikande stil och hör sannolikt inte till den ursprungliga stenen (Daniels egen observation 2026) → exempel på att monument byggs på i faser. Stenen stod ursprungligen mellan två gravhögar. Räknas som Ölands äldsta runsten, men året är osäkert.'
 where signum = 'Öl 1';
