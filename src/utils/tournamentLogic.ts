import { MATCHES, MATCHES_BY_ID, SPORTS_BY_ID, TEAMS, TEAMS_BY_ID } from '../data/tournamentData';
import type {
  Match,
  MatchOutcome,
  OverlapAlert,
  ParticipantSearchItem,
  ResolvedAgendaMatch,
  SportId,
  SportUserStatus,
  Team,
  UserProfile,
} from '../types/tournament';

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[.,:;+'"’`_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseTimeToMinutes(time: string): number {
  const [hStr, mStr] = time.split(':');
  const h = Number.parseInt(hStr, 10);
  const m = Number.parseInt(mStr, 10);
  return h * 60 + m;
}

/**
 * Maps known PDF spelling/abbreviation variations of the same student
 * to a single canonical player key so "Mi Agenda" aggregates all their sports.
 * Literal player names in TEAMS remain untouched.
 */
const PLAYER_ALIAS_MAP: Record<string, string> = {
  'ismael barea': 'ismael barea dris',
  'ismael martinez': 'ismael martinez amar',
  'javier aragon': 'javier aragon guerra',
  'faustino padial': 'faustino padial cimarro',
  'esther parra': 'esther parra romero',
  'helena fernandez': 'helena fernandez gallegos',
  'victoria baron': 'victoria baron martinez',
  'sofia abdurrahman': 'sofia abdurrahman borras elfarrah',
  'sergio araguache': 'sergio perez araguache',
  'hammaoui ben bassou mohamed': 'mohamed hammaoui ben bassou',
  'yacob uasani': 'yacob abdelkader uasani',
  'hid chaibi el bachiri': 'hind chaibi el bachiri',
  'amira mansour bouzalmate': 'amira manssour bouzalmate',
  'manar bouchi mehamed': 'manar bouich mehamed',
  'salma el badadi benaisa': 'salma el bagdadi benaisa',
  'selma mohamed m hamed': 'salma mohamed m hamed',
  'pablo lopez carasco': 'pablo lopez carrasco',
  'faris chekri kourayche': 'farid chekri kourayche',
  'tomfar': 'tomas liberatore dargam',
  'fernando herraiz': 'fernandi herraiz corralo',
  'iria marquez gazteloumendi': 'iria marquez gaztelumendi',
  'maria soledad gomez baldouhali': 'maria soledad gomez belbouhali',
  'alba ramirez jimenez': 'alba maria ramirez jimenez',
  'mario oliva lopez mo': 'mario oliva lopez',
  'jose francisco garcia ponde de leon': 'jose francisco garcia ponce de leon',
  'housam benaim': 'housam benaim rabii',
};

export function getCanonicalPlayerKey(rawName: string): string {
  const norm = normalizeText(rawName);
  return PLAYER_ALIAS_MAP[norm] ?? norm;
}

function chooseBestDisplayName(current: string, candidate: string): string {
  // Prefer longer, properly accented names that aren't ALL CAPS
  const isAllCaps = (s: string) => s === s.toUpperCase() && /[A-Z]/.test(s);
  const score = (s: string) => {
    let pts = s.length;
    if (/[áéíóúñÁÉÍÓÚÑ]/.test(s)) pts += 6;
    if (isAllCaps(s)) pts -= 10;
    if (/^[a-z]/.test(s)) pts -= 4;
    return pts;
  };
  return score(candidate) > score(current) ? candidate : current;
}

let cachedSearchIndex: ParticipantSearchItem[] | null = null;

export function getParticipantSearchIndex(): ParticipantSearchItem[] {
  if (cachedSearchIndex) return cachedSearchIndex;

  const playerMap = new Map<
    string,
    {
      displayName: string;
      aliases: Set<string>;
      teamIds: Set<string>;
      sportIds: Set<SportId>;
    }
  >();

  for (const team of TEAMS) {
    for (const rawPlayer of team.players) {
      const key = getCanonicalPlayerKey(rawPlayer);
      const existing = playerMap.get(key);
      if (existing) {
        existing.displayName = chooseBestDisplayName(existing.displayName, rawPlayer);
        existing.aliases.add(normalizeText(rawPlayer));
        existing.teamIds.add(team.id);
        existing.sportIds.add(team.sportId);
      } else {
        playerMap.set(key, {
          displayName: rawPlayer,
          aliases: new Set([normalizeText(rawPlayer), key]),
          teamIds: new Set([team.id]),
          sportIds: new Set([team.sportId]),
        });
      }
    }
  }

  const items: ParticipantSearchItem[] = [];

  for (const [key, entry] of playerMap.entries()) {
    const sportIds = Array.from(entry.sportIds);
    const sportLabels = sportIds.map((id) => SPORTS_BY_ID[id].shortName).join(' · ');
    const teamNames = Array.from(entry.teamIds)
      .map((tid) => TEAMS_BY_ID[tid]?.name ?? '')
      .map(normalizeText)
      .join(' ');
    items.push({
      kind: 'player',
      id: `player:${key}`,
      displayName: entry.displayName,
      normalizedSearch: `${Array.from(entry.aliases).join(' ')} ${teamNames}`,
      subtitle: `${sportIds.length} ${sportIds.length === 1 ? 'deporte' : 'deportes'}: ${sportLabels}`,
      sportIds,
      teamIds: Array.from(entry.teamIds),
    });
  }

  // Also include multi-player teams & pairs for team search
  for (const team of TEAMS) {
    if (team.players.length <= 1) continue;
    const sport = SPORTS_BY_ID[team.sportId];
    items.push({
      kind: 'team',
      id: `team:${team.id}`,
      displayName: team.name,
      normalizedSearch: `${normalizeText(team.name)} ${normalizeText(sport.name)} ${team.players.map(normalizeText).join(' ')}`,
      subtitle: `Equipo de ${sport.name} · ${team.players.length} integrantes`,
      sportIds: [team.sportId],
      teamIds: [team.id],
    });
  }

  items.sort((a, b) => a.displayName.localeCompare(b.displayName, 'es'));
  cachedSearchIndex = items;
  return items;
}

export function searchParticipants(query: string, limit = 16): ParticipantSearchItem[] {
  const norm = normalizeText(query);
  if (!norm) return [];
  const tokens = norm.split(' ').filter(Boolean);
  const index = getParticipantSearchIndex();

  const scored: Array<{ item: ParticipantSearchItem; score: number }> = [];

  for (const item of index) {
    const nameNorm = normalizeText(item.displayName);
    const allMatch = tokens.every((t) => item.normalizedSearch.includes(t));
    if (!allMatch) continue;

    let score = 0;
    if (nameNorm === norm) score += 100;
    else if (nameNorm.startsWith(norm)) score += 60;
    else if (tokens.every((t) => nameNorm.includes(t))) score += 40;
    else score += 10;

    if (item.kind === 'player') score += 15;
    score += item.sportIds.length * 2;
    scored.push({ item, score });
  }

  scored.sort((a, b) => b.score - a.score || a.item.displayName.localeCompare(b.item.displayName, 'es'));
  return scored.slice(0, limit).map((s) => s.item);
}

export function profileFromSearchItem(item: ParticipantSearchItem): UserProfile {
  return {
    kind: item.kind,
    id: item.id,
    displayName: item.displayName,
    sportId: item.kind === 'team' ? item.sportIds[0] : undefined,
    teamIds: item.teamIds,
  };
}

export function getMatchesForSport(sportId: SportId): Match[] {
  return MATCHES.filter((m) => m.sportId === sportId);
}

export function findNextKnockoutMatch(matchId: string): Match | undefined {
  const current = MATCHES_BY_ID[matchId];
  if (!current) return undefined;
  return MATCHES.find(
    (m) =>
      m.sportId === current.sportId &&
      ((m.home.type === 'winnerOf' && m.home.matchId === matchId) ||
        (m.away.type === 'winnerOf' && m.away.matchId === matchId))
  );
}

export function getDownstreamMatchIds(matchId: string): string[] {
  const result: string[] = [];
  let cursor = findNextKnockoutMatch(matchId);
  while (cursor) {
    result.push(cursor.id);
    cursor = findNextKnockoutMatch(cursor.id);
  }
  return result;
}

/**
 * Updates the outcomes map cleanly:
 * - Clicking the already-selected outcome clears it (returns to Pending).
 * - Clearing or marking 'loss' in a knockout sport removes outcomes of all downstream matches.
 */
export function toggleMatchOutcome(
  currentOutcomes: Record<string, MatchOutcome>,
  matchId: string,
  nextOutcome: MatchOutcome
): Record<string, MatchOutcome> {
  const match = MATCHES_BY_ID[matchId];
  const updated = { ...currentOutcomes };
  const isClearing = updated[matchId] === nextOutcome;

  if (isClearing) {
    delete updated[matchId];
  } else {
    updated[matchId] = nextOutcome;
  }

  if (match && SPORTS_BY_ID[match.sportId].format === 'knockout') {
    if (isClearing || nextOutcome === 'loss') {
      for (const downstreamId of getDownstreamMatchIds(matchId)) {
        delete updated[downstreamId];
      }
    }
  }

  return updated;
}

function buildResolvedMatch(
  match: Match,
  userTeam: Team,
  isHome: boolean,
  outcome: MatchOutcome | undefined
): ResolvedAgendaMatch {
  const sport = SPORTS_BY_ID[match.sportId];
  const opponentSlot = isHome ? match.away : match.home;
  const startMinutes = parseTimeToMinutes(match.time);
  const endMinutes = match.endTime ? parseTimeToMinutes(match.endTime) : startMinutes + 15;

  let opponentDisplay = '';
  let opponentTeamId: string | undefined;
  let opponentConfirmed = false;
  let opponentOriginSubtitle: string | undefined;
  let isByeDirectOpponent = false;

  if (opponentSlot.type === 'team') {
    const oppTeam = TEAMS_BY_ID[opponentSlot.teamId];
    opponentDisplay = oppTeam?.name ?? opponentSlot.teamId;
    opponentTeamId = opponentSlot.teamId;
    opponentConfirmed = true;
    // Direct-bye opponent waiting in Round 2+ (e.g., Real Mae West, Vodka Juniors, etc.)
    isByeDirectOpponent = match.roundIndex > 0 && sport.format === 'knockout';
  } else {
    const srcMatch = MATCHES_BY_ID[opponentSlot.matchId];
    const codeLabel = srcMatch ? srcMatch.displayCode : opponentSlot.matchId;
    opponentDisplay = `Rival por confirmar (Ganador de ${codeLabel})`;
    opponentConfirmed = false;

    if (
      srcMatch &&
      srcMatch.roundIndex === 0 &&
      srcMatch.home.type === 'team' &&
      srcMatch.away.type === 'team'
    ) {
      const homeName = TEAMS_BY_ID[srcMatch.home.teamId]?.name ?? '';
      const awayName = TEAMS_BY_ID[srcMatch.away.teamId]?.name ?? '';
      if (homeName && awayName) {
        opponentOriginSubtitle = `Sale de: ${homeName} vs ${awayName}`;
      }
    }
  }

  return {
    matchId: match.id,
    sportId: match.sportId,
    sportName: sport.name,
    format: sport.format,
    roundIndex: match.roundIndex,
    roundName: match.roundName,
    displayCode: match.displayCode,
    time: match.time,
    endTime: match.endTime,
    startMinutes,
    endMinutes,
    zoneId: sport.zoneId,
    zoneLabel: sport.zoneLabel,
    court: match.court ?? sport.defaultCourt,
    userTeamId: userTeam.id,
    userTeamName: userTeam.name,
    isHome,
    opponentDisplay,
    opponentTeamId,
    opponentConfirmed,
    opponentOriginSubtitle,
    isByeDirectOpponent,
    outcome,
    eliminatedLabel:
      sport.format === 'knockout' && outcome === 'loss'
        ? `Eliminado en ${match.roundName}`
        : undefined,
    isFinal: match.isFinal,
  };
}

export interface UserAgendaResult {
  matches: ResolvedAgendaMatch[];
  overlaps: OverlapAlert[];
  sportStatuses: Record<string, SportUserStatus>;
}

export function buildUserAgenda(
  profile: UserProfile | null,
  outcomes: Record<string, MatchOutcome>,
  includeGincana = false
): UserAgendaResult {
  if (!profile) {
    return { matches: [], overlaps: [], sportStatuses: {} };
  }

  const resolved: ResolvedAgendaMatch[] = [];
  const sportStatuses: Record<string, SportUserStatus> = {};

  for (const teamId of profile.teamIds) {
    const team = TEAMS_BY_ID[teamId];
    if (!team) continue;
    const sport = SPORTS_BY_ID[team.sportId];
    const sportMatches = getMatchesForSport(team.sportId);

    const status: SportUserStatus = {
      sportId: team.sportId,
      teamId: team.id,
      teamName: team.name,
      unlockedMatchIds: [],
      activeMatchIds: [],
    };

    if (sport.format === 'league') {
      const teamMatches = sportMatches.filter(
        (m) =>
          (m.home.type === 'team' && m.home.teamId === team.id) ||
          (m.away.type === 'team' && m.away.teamId === team.id)
      );
      for (const m of teamMatches) {
        const isHome = m.home.type === 'team' && m.home.teamId === team.id;
        status.unlockedMatchIds.push(m.id);
        status.activeMatchIds.push(m.id);
        resolved.push(buildResolvedMatch(m, team, isHome, outcomes[m.id]));
      }
    } else if (sport.format === 'knockout') {
      // Find initial match where this team appears directly (R1 or R2 after bye)
      const initialMatch = sportMatches.find(
        (m) =>
          (m.home.type === 'team' && m.home.teamId === team.id) ||
          (m.away.type === 'team' && m.away.teamId === team.id)
      );

      if (initialMatch) {
        let currentMatch: Match | undefined = initialMatch;
        let currentIsHome =
          initialMatch.home.type === 'team' && initialMatch.home.teamId === team.id;

        while (currentMatch) {
          const outcome = outcomes[currentMatch.id];
          status.unlockedMatchIds.push(currentMatch.id);
          if (outcome !== 'loss') {
            status.activeMatchIds.push(currentMatch.id);
          }

          resolved.push(buildResolvedMatch(currentMatch, team, currentIsHome, outcome));

          if (outcome === 'win') {
            const nextMatch = findNextKnockoutMatch(currentMatch.id);
            if (!nextMatch) {
              status.wonTournament = true;
              break;
            }
            currentIsHome =
              nextMatch.home.type === 'winnerOf' && nextMatch.home.matchId === currentMatch.id;
            currentMatch = nextMatch;
          } else {
            if (outcome === 'loss') {
              status.eliminatedInRound = currentMatch.roundName;
            }
            break;
          }
        }
      }
    }

    sportStatuses[team.sportId] = status;
  }

  if (includeGincana) {
    const gincanaSport = SPORTS_BY_ID['gincana'];
    resolved.push({
      matchId: 'GINCANA-MAIN',
      sportId: 'gincana',
      sportName: gincanaSport.name,
      format: 'activity',
      roundIndex: 0,
      roundName: 'Actividad Continua',
      displayCode: '13:00 – 14:00',
      time: '13:00',
      endTime: '14:00',
      startMinutes: 13 * 60,
      endMinutes: 14 * 60,
      zoneId: gincanaSport.zoneId,
      zoneLabel: gincanaSport.zoneLabel,
      court: gincanaSport.defaultCourt,
      userTeamId: 'gincana-entry',
      userTeamName: profile.displayName,
      isHome: false,
      opponentDisplay: 'Recorrido por pruebas (validación foto/vídeo)',
      opponentConfirmed: true,
      isByeDirectOpponent: false,
      isGincana: true,
    });
  }

  resolved.sort((a, b) => {
    if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes;
    return a.sportName.localeCompare(b.sportName, 'es') || a.displayCode.localeCompare(b.displayCode, 'es');
  });

  const overlaps = detectOverlaps(resolved);

  return { matches: resolved, overlaps, sportStatuses };
}

/**
 * Detects overlaps between active matches in the user's timeline.
 * Two matches overlap if:
 * - They start less than 15 minutes apart (same start time or <15 min gap), OR
 * - One spans a window (like Gincana 13:00-14:00) that overlaps the other's interval.
 * Matches where the user already marked 'loss' are excluded from active future conflict checks
 * ONLY when checking eliminated downstream slots (which are already absent from `matches`);
 * we also skip comparing two matches if either is already marked 'loss' so losing a match doesn't keep flagging.
 */
export function detectOverlaps(matches: ResolvedAgendaMatch[]): OverlapAlert[] {
  const active = matches.filter((m) => m.outcome !== 'loss');
  const alerts: OverlapAlert[] = [];

  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];

      const startDiff = Math.abs(b.startMinutes - a.startMinutes);
      const intervalsOverlap = a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes;
      const tooClose = startDiff < 15;

      if (intervalsOverlap || tooClose) {
        alerts.push({
          id: `${a.matchId}__${b.matchId}`,
          matchA: a,
          matchB: b,
          gapMinutes: startDiff,
          message:
            a.isGincana || b.isGincana
              ? `${a.sportName} (${a.displayCode}) coincide con ${b.sportName} (${b.displayCode}).`
              : startDiff === 0
                ? `${a.sportName} (${a.displayCode}) y ${b.sportName} (${b.displayCode}) comienzan exactamente a la misma hora (${a.time}).`
                : `${a.sportName} (${a.displayCode}) y ${b.sportName} (${b.displayCode}) están separados por solo ${startDiff} min.`,
        });
      }
    }
  }

  return alerts;
}

export interface BracketDisplaySlot {
  label: string;
  teamId?: string;
  isUserTeam: boolean;
  isConfirmed: boolean;
  originCode?: string;
}

/**
 * Resolves how a match card should be displayed in "Cuadrantes",
 * highlighting the active user's team and personal unlocked path while keeping
 * unrelated matches as "Ganador de [código]".
 */
export function resolveBracketMatchForView(
  match: Match,
  userProfile: UserProfile | null,
  sportStatus?: SportUserStatus
): {
  home: BracketDisplaySlot;
  away: BracketDisplaySlot;
  isUserMatch: boolean;
} {
  const userTeamId = sportStatus?.teamId;
  const userTeam = userTeamId ? TEAMS_BY_ID[userTeamId] : undefined;
  const unlockedSet = new Set(sportStatus?.unlockedMatchIds ?? []);
  const isUserMatch = Boolean(userTeam && unlockedSet.has(match.id));

  const resolveSlot = (slot: Match['home']): BracketDisplaySlot => {
    if (slot.type === 'team') {
      const t = TEAMS_BY_ID[slot.teamId];
      const isUser = Boolean(userProfile && userProfile.teamIds.includes(slot.teamId));
      return {
        label: t?.name ?? slot.teamId,
        teamId: slot.teamId,
        isUserTeam: isUser,
        isConfirmed: true,
      };
    }

    const srcMatch = MATCHES_BY_ID[slot.matchId];
    const code = srcMatch?.displayCode ?? slot.matchId;

    // If the user has unlocked this match via winning `slot.matchId`, display the user's team here!
    if (userTeam && isUserMatch && unlockedSet.has(slot.matchId)) {
      return {
        label: userTeam.name,
        teamId: userTeam.id,
        isUserTeam: true,
        isConfirmed: true,
        originCode: code,
      };
    }

    return {
      label: `Ganador de ${code}`,
      isUserTeam: false,
      isConfirmed: false,
      originCode: code,
    };
  };

  return {
    home: resolveSlot(match.home),
    away: resolveSlot(match.away),
    isUserMatch,
  };
}
