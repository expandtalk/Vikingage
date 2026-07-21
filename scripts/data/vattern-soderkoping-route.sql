-- Vikingatida inre vattenled Vättern–Söderköping (Göta kanals föregångare).
-- Applicerad via MCP execute_sql; fil = proveniens. Sjökedja Vättern(Motala)→Boren→
-- Roxen→(viker av vid Norsholm, EJ ned längs Motala ström)→Asplången→Söderköping→
-- Slätbaken. Höjdryggar passerade med portage. Koordinater = kända sjö-/ortlägen.
with ins as (
  insert into river_systems (name, name_en, description, period, significance, historical_significance, color, width, importance, type, total_length_km)
  values (
    'Vättern–Söderköping (Göta kanals föregångare)',
    'Vättern–Söderköping (precursor of the Göta Canal)',
    'Vikingatida inre vattenled genom östgötska sjökedjan: från Vättern vid Motala via Boren till Roxen, och därifrån — INTE ned längs Motala ström mot Norrköping utan österut via Asplången — mot Söderköping och Slätbaken i Östersjön. Höjdryggarna mellan sjöarna passerades med lastdragning (portage). Samma sträckning grävdes långt senare ut till Göta kanal.',
    'viking_age', 'Inre öst-västlig transportled Vättern↔Östersjön',
    'Kopplade Vätterbygden till Östersjön via Söderköping utan att följa Motala ströms utlopp mot Bråviken.',
    '#0369a1', 4, 'primary', 'sailing_route', 95
  ) returning id
)
insert into river_coordinates (river_system_id, sequence_order, latitude, longitude, name, name_en, description, is_trading_post, is_portage)
select (select id from ins), * from (values
  (1, 58.5370, 15.0410, 'Motala (Vätterns utlopp)', 'Motala (outlet of Vättern)', 'Startpunkt vid Vättern', false, false),
  (2, 58.5520, 15.2830, 'Boren (Borensberg)', 'Lake Boren', 'Genom sjön Boren', false, false),
  (3, 58.4750, 15.5600, 'Berg (höjdrygg)', 'Berg (height)', 'Lastdragning över höjdryggen mellan Boren och Roxen', false, true),
  (4, 58.4860, 15.6700, 'Roxen', 'Lake Roxen', 'Genom sjön Roxen', false, false),
  (5, 58.4870, 15.9000, 'Norsholm', 'Norsholm', 'Roxens östra ände — leden viker av mot Asplången (ej ned längs Motala ström)', false, true),
  (6, 58.4370, 15.9800, 'Asplången', 'Lake Asplången', 'Genom sjön Asplången', false, false),
  (7, 58.4810, 16.3230, 'Söderköping', 'Söderköping', 'Handelsstad vid leden', true, false),
  (8, 58.4300, 16.5600, 'Slätbaken', 'Slätbaken (Baltic inlet)', 'Östersjöinloppet', false, false)
) as v(sequence_order, latitude, longitude, name, name_en, description, is_trading_post, is_portage);
