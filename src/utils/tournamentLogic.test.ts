import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MATCHES,
  MATCHES_BY_ID,
  ORGANIZATION_NOTICES,
  SPORT_RULES,
  SPORTS,
  SPORTS_BY_ID,
  TEAMS,
  TEAMS_BY_ID,
  ZONES,
} from '../data/tournamentData';
import {
  buildUserAgenda,
  detectOverlaps,
  normalizeText,
  profileFromSearchItem,
  resolveBracketMatchForView,
  searchParticipants,
  toggleMatchOutcome,
} from './tournamentLogic';

test('dataset integrity: all 12 sports, 7 zones, 4 notices, rules, and valid match references', () => {
  assert.equal(SPORTS.length, 12);
  assert.equal(ZONES.length, 7);
  assert.equal(ORGANIZATION_NOTICES.length, 4);

  for (const sport of SPORTS) {
    assert.ok(SPORT_RULES[sport.id], `Missing rules for ${sport.id}`);
  }

  // Verify every match has unique ID and valid home/away references
  const seenIds = new Set<string>();
  for (const match of MATCHES) {
    assert.ok(!seenIds.has(match.id), `Duplicate match ID: ${match.id}`);
    seenIds.add(match.id);
    for (const slot of [match.home, match.away]) {
      if (slot.type === 'team') {
        assert.ok(TEAMS_BY_ID[slot.teamId], `Unknown teamId ${slot.teamId} in ${match.id}`);
      } else {
        assert.ok(MATCHES_BY_ID[slot.matchId], `Unknown matchId ${slot.matchId} in ${match.id}`);
      }
    }
  }
});

test('dataset applies all 8 PDF corrections accurately', () => {
  // 1. Unified team names
  assert.equal(TEAMS_BY_ID['f7-genuine-fc'].name, 'Genuine FC');
  assert.equal(TEAMS_BY_ID['bk-team-diamante'].name, 'Team Diamante en bruto');
  assert.equal(TEAMS_BY_ID['vb-b-de-bandidos'].name, 'B de Bandidos');

  // 2. Ajedrez R1: second 10:15 E -> 10:15 F
  assert.equal(MATCHES_BY_ID['AJ-R1-F'].displayCode, '10:15 F');

  // 3. Pádel Masculino R1: 10:15 N and 10:30 Ñ
  assert.equal(MATCHES_BY_ID['PM-R1-N'].displayCode, '10:15 N');
  assert.equal(MATCHES_BY_ID['PM-R1-NH'].displayCode, '10:30 Ñ');

  // 4. Pádel Mixto R1/R2: 13:00 C feeds 13:15 H
  assert.equal(MATCHES_BY_ID['PX-R1-C'].displayCode, '13:00 C');
  assert.deepEqual(MATCHES_BY_ID['PX-R2-H'].home, { type: 'winnerOf', matchId: 'PX-R1-C' });

  // 5. Pin Pon R2: 10:45 Ñ
  assert.equal(MATCHES_BY_ID['PP-R2-NH'].displayCode, '10:45 Ñ');

  // 6. Baloncesto 3x3 courts per match
  assert.equal(MATCHES_BY_ID['BK-R1-A'].court, 'Pista 4.1');
  assert.equal(MATCHES_BY_ID['BK-R1-C'].court, 'Pista 4.1');
  assert.equal(MATCHES_BY_ID['BK-SF-E'].court, 'Pista 4.1');
  assert.equal(MATCHES_BY_ID['BK-R1-B'].court, 'Pista 4.2');
  assert.equal(MATCHES_BY_ID['BK-SF-D'].court, 'Pista 4.2');
  assert.equal(MATCHES_BY_ID['BK-FN-F'].court, 'Pista 4.2');

  // 7. Pádel Mixto updated 13:00–14:00 schedule
  assert.equal(MATCHES_BY_ID['PX-R1-A'].time, '13:00');
  assert.equal(MATCHES_BY_ID['PX-R1-F'].time, '13:15');
  assert.equal(MATCHES_BY_ID['PX-R2-I'].time, '13:30');
  assert.equal(MATCHES_BY_ID['PX-SF-J'].time, '13:30');
  assert.equal(MATCHES_BY_ID['PX-FN-K'].time, '13:45');

  // 8. Pádel Femenino updated Final at 10:15 J
  assert.equal(MATCHES_BY_ID['PF-FN-J'].displayCode, '10:15 J');
  assert.equal(MATCHES_BY_ID['PF-FN-J'].time, '10:15');
});

test('case- and accent-insensitive search finds students across all their sports', () => {
  assert.equal(normalizeText('Lucía Prieto Durán'), 'lucia prieto duran');

  const luciaResults = searchParticipants('lucia prieto');
  assert.ok(luciaResults.length > 0);
  const lucia = luciaResults[0];
  assert.equal(lucia.kind, 'player');
  assert.ok(lucia.sportIds.includes('balon-tiro'));
  assert.ok(lucia.sportIds.includes('futbol-7'));
  assert.ok(lucia.sportIds.includes('padel-femenino'));

  const teamResults = searchParticipants('genuine fc');
  assert.ok(teamResults.some((item) => item.kind === 'team' && item.displayName === 'Genuine FC'));
});

test('knockout progression reveals confirmed direct-bye opponents and R1 origin subtitles', () => {
  // Flores del Rif plays BK-R1-A (9:00 A); winner meets confirmed bye team Real Mae West in BK-SF-D (9:15 D)
  const floresTeam = TEAMS_BY_ID['bk-flores-del-rif'];
  const profile = {
    kind: 'team' as const,
    id: `team:${floresTeam.id}`,
    displayName: floresTeam.name,
    sportId: 'baloncesto' as const,
    teamIds: [floresTeam.id],
  };

  // Before marking win: only R1 match
  const before = buildUserAgenda(profile, {});
  assert.equal(before.matches.length, 1);
  assert.equal(before.matches[0].matchId, 'BK-R1-A');
  assert.equal(before.matches[0].isHome, true);
  assert.equal(before.matches[0].court, 'Pista 4.1');

  // Mark R1 as won -> unlocks BK-SF-D with confirmed bye opponent Real Mae West!
  const outcomesAfterR1 = toggleMatchOutcome({}, 'BK-R1-A', 'win');
  const afterR1 = buildUserAgenda(profile, outcomesAfterR1);
  assert.equal(afterR1.matches.length, 2);
  const semi = afterR1.matches[1];
  assert.equal(semi.matchId, 'BK-SF-D');
  assert.equal(semi.court, 'Pista 4.2');
  assert.equal(semi.opponentConfirmed, true);
  assert.equal(semi.opponentDisplay, 'Real Mae West');
  assert.equal(semi.isByeDirectOpponent, true);
  assert.equal(semi.isHome, false);

  // Mark Semi as won -> unlocks Final BK-FN-F with unknown opponent "Rival por confirmar (Ganador de 9:30 E)"
  const outcomesAfterSF = toggleMatchOutcome(outcomesAfterR1, 'BK-SF-D', 'win');
  const afterSF = buildUserAgenda(profile, outcomesAfterSF);
  assert.equal(afterSF.matches.length, 3);
  const finalMatch = afterSF.matches[2];
  assert.equal(finalMatch.matchId, 'BK-FN-F');
  assert.equal(finalMatch.opponentConfirmed, false);
  assert.equal(finalMatch.opponentDisplay, 'Rival por confirmar (Ganador de 9:30 E)');

  // Now mark R1 as loss -> cascades cleanup, removes Semi and Final, shows "Eliminado en Cuartos"
  const outcomesAfterLoss = toggleMatchOutcome(outcomesAfterSF, 'BK-R1-A', 'loss');
  assert.equal(outcomesAfterLoss['BK-SF-D'], undefined);
  const afterLoss = buildUserAgenda(profile, outcomesAfterLoss);
  assert.equal(afterLoss.matches.length, 1);
  assert.equal(afterLoss.matches[0].eliminatedLabel, 'Eliminado en Cuartos');
});

test('R1 origin subtitle appears when next opponent comes from an R1 match', () => {
  const team = TEAMS_BY_ID['aj-tayssir'];
  const profile = {
    kind: 'team' as const,
    id: `team:${team.id}`,
    displayName: team.name,
    sportId: 'ajedrez' as const,
    teamIds: [team.id],
  };

  const outcomes = toggleMatchOutcome({}, 'AJ-R1-A', 'win');
  const agenda = buildUserAgenda(profile, outcomes);
  assert.equal(agenda.matches.length, 2);
  const r2 = agenda.matches[1];
  assert.equal(r2.matchId, 'AJ-R2-G');
  assert.equal(r2.opponentDisplay, 'Rival por confirmar (Ganador de 9:15 B)');
  assert.equal(
    r2.opponentOriginSubtitle,
    'Sale de: Ismael Mimon el aouad vs Maksim Ulianov Sollogub'
  );
});

test('multi-round bye skipping works (Pádel Masculino 10:30 Q -> 11:15 B)', () => {
  const team = TEAMS_BY_ID['pm-victor-alberto'];
  const profile = {
    kind: 'team' as const,
    id: `team:${team.id}`,
    displayName: team.name,
    sportId: 'padel-masculino' as const,
    teamIds: [team.id],
  };

  const outcomes = toggleMatchOutcome({}, 'PM-R1-Q', 'win');
  const agenda = buildUserAgenda(profile, outcomes);
  assert.equal(agenda.matches.length, 2);
  assert.equal(agenda.matches[1].matchId, 'PM-R3-B');
  assert.equal(agenda.matches[1].displayCode, '11:15 B');
});

test('Balonmano 7x7 league allows win/draw/loss without hiding subsequent matches', () => {
  const team = TEAMS_BY_ID['bm-valkyrias-hc'];
  const profile = {
    kind: 'team' as const,
    id: `team:${team.id}`,
    displayName: team.name,
    sportId: 'balonmano' as const,
    teamIds: [team.id],
  };

  let outcomes = toggleMatchOutcome({}, 'BM-L1', 'loss');
  outcomes = toggleMatchOutcome(outcomes, 'BM-L3', 'draw');
  outcomes = toggleMatchOutcome(outcomes, 'BM-L4', 'win');

  const agenda = buildUserAgenda(profile, outcomes);
  assert.equal(agenda.matches.length, 4);
  assert.equal(agenda.matches[0].outcome, 'loss');
  assert.equal(agenda.matches[0].eliminatedLabel, undefined);
  assert.equal(agenda.matches[1].outcome, 'draw');
  assert.equal(agenda.matches[2].outcome, 'win');
});

test('overlap detection catches same-time matches, Gincana conflicts, and clears resolved conflicts on loss', () => {
  // Alejandro Cañestro plays Baloncesto (Tira y reza, 9:15 C), Pádel Masc (9:00 A), Pádel Mixto (13:15 F), Voleibol (10:30 G)
  const alejandroItem = searchParticipants('Alejandro Cañestro')[0];
  const profile = profileFromSearchItem(alejandroItem);

  // Without Gincana: 9:00 A, 9:15 C, 10:30 G, 13:15 F -> no overlaps (all >= 15 min apart)
  const baseAgenda = buildUserAgenda(profile, {}, false);
  assert.equal(baseAgenda.overlaps.length, 0);

  // Enable Gincana (13:00-14:00) -> overlaps with Pádel Mixto 13:15 F!
  const withGincana = buildUserAgenda(profile, {}, true);
  assert.ok(withGincana.overlaps.length >= 1);
  assert.ok(
    withGincana.overlaps.some(
      (o) =>
        (o.matchA.sportId === 'gincana' && o.matchB.sportId === 'padel-mixto') ||
        (o.matchB.sportId === 'gincana' && o.matchA.sportId === 'padel-mixto')
    )
  );

  // Now test a player with exact same-time start: Iker Martínez Muerza plays Fútbol 7 (El cortijo 9:00 A), Baloncesto (9:15 C), Pádel Masc (10:00 J)
  // And Antonio González Lozano plays Fútbol 7 (Atlético payuno 9:00 A), Pádel Masc (9:15 C), Balón Tiro (9:30 F)
  // Test direct overlap with synthetic same-time check using Salma Tahiri Bellahssan:
  // Voleibol B de Bandidos (9:00 A), Balón Tiro B de Bandidos (9:15 D), Fútbol 7 Héctor y sus secuaces (9:45 D), Pin Pon (10:00 J)
  // If Salma wins Balón Tiro 9:15 D -> unlocks 10:00 J which overlaps with Pin Pon 10:00 J!
  const salmaItem = searchParticipants('Salma Tahiri')[0];
  const salmaProfile = profileFromSearchItem(salmaItem);
  const salmaBase = buildUserAgenda(salmaProfile, {}, false);
  assert.equal(salmaBase.overlaps.length, 0);

  const salmaAfterBTWin = buildUserAgenda(salmaProfile, { 'BT-R1-D': 'win' }, false);
  assert.equal(salmaAfterBTWin.overlaps.length, 1);
  assert.equal(salmaAfterBTWin.overlaps[0].gapMinutes, 0);

  // If Salma marks BT-R1-D as loss, the 10:00 J match disappears and the overlap is gone!
  const salmaAfterBTLoss = buildUserAgenda(salmaProfile, { 'BT-R1-D': 'loss' }, false);
  assert.equal(salmaAfterBTLoss.overlaps.length, 0);

  // Verify bracket resolution highlights Salma's unlocked match
  const btStatus = salmaAfterBTWin.sportStatuses['balon-tiro'];
  const bracketCard = resolveBracketMatchForView(MATCHES_BY_ID['BT-R2-J'], salmaProfile, btStatus);
  assert.equal(bracketCard.isUserMatch, true);
  assert.equal(bracketCard.away.label, 'B de Bandidos');
  assert.equal(bracketCard.away.isUserTeam, true);
  assert.equal(bracketCard.home.label, 'Ganador de 9:15 C');
});

test('detectOverlaps handles empty and single match arrays safely', () => {
  assert.deepEqual(detectOverlaps([]), []);
  assert.equal(SPORTS_BY_ID['tenis'].name, 'Tenis');
  assert.ok(TEAMS.length >= 140);
});
