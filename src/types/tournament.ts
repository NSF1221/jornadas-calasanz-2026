export type SportId =
  | 'ajedrez'
  | 'balon-tiro'
  | 'baloncesto'
  | 'balonmano'
  | 'futbol-7'
  | 'padel-femenino'
  | 'padel-masculino'
  | 'padel-mixto'
  | 'pin-pon'
  | 'tenis'
  | 'voleibol'
  | 'gincana';

export type ZoneId = '1' | '2' | '3' | '4' | '5' | '6' | '7';

export type SportFormat = 'knockout' | 'league' | 'activity';

export type MatchOutcome = 'win' | 'loss' | 'draw';

export interface Team {
  id: string;
  sportId: SportId;
  name: string;
  shortName?: string;
  players: string[];
}

export type MatchSlot =
  | { type: 'team'; teamId: string }
  | { type: 'winnerOf'; matchId: string };

export interface Match {
  id: string;
  sportId: SportId;
  roundIndex: number;
  roundName: string;
  displayCode: string;
  time: string; // "HH:MM"
  endTime?: string; // e.g. "12:45" for Balonmano league slots
  court?: string; // Specific court override (e.g. "Pista 4.1", "Pista 4.2")
  home: MatchSlot;
  away: MatchSlot;
  isFinal?: boolean;
}

export interface RoundBye {
  roundIndex: number;
  roundName: string;
  slot: MatchSlot;
  note?: string;
}

export interface SportRule {
  sportId: SportId;
  duration: string;
  playersOnCourt: string;
  serveRule: string;
  scoring: string;
  tiebreaker: string;
  latePenalty: string;
  materialSanction: string;
  communicationRule: string;
  extraNotes: string[];
  isOfficialOnly?: boolean;
}

export interface SportConfig {
  id: SportId;
  name: string;
  shortName: string;
  format: SportFormat;
  zoneId: ZoneId;
  zoneLabel: string;
  defaultCourt: string;
  scheduleSummary: string;
  rounds: string[];
  byes: RoundBye[];
  updatedNote?: string;
}

export interface OrganizationNotice {
  id: string;
  title: string;
  description: string;
  sportIds: SportId[];
  severity: 'important' | 'schedule' | 'location';
}

export interface ZoneInfo {
  id: ZoneId;
  name: string;
  shortLabel: string;
  statusTag?: string;
  description: string;
  sportIds: SportId[];
  scheduleSummary: string;
  subCourts?: string[];
  relocatedNote?: string;
}

export interface UserProfile {
  kind: 'player' | 'team';
  id: string;
  displayName: string;
  sportId?: SportId; // Used if kind === 'team'
  teamIds: string[];
}

export interface ParticipantSearchItem {
  kind: 'player' | 'team';
  id: string;
  displayName: string;
  normalizedSearch: string;
  subtitle: string;
  sportIds: SportId[];
  teamIds: string[];
}

export interface ResolvedAgendaMatch {
  matchId: string;
  sportId: SportId;
  sportName: string;
  format: SportFormat;
  roundIndex: number;
  roundName: string;
  displayCode: string;
  time: string;
  endTime?: string;
  startMinutes: number;
  endMinutes: number;
  zoneId: ZoneId;
  zoneLabel: string;
  court: string;
  userTeamId: string;
  userTeamName: string;
  isHome: boolean;
  opponentDisplay: string;
  opponentTeamId?: string;
  opponentConfirmed: boolean;
  opponentOriginSubtitle?: string;
  isByeDirectOpponent: boolean;
  outcome?: MatchOutcome;
  eliminatedLabel?: string;
  isFinal?: boolean;
  isGincana?: boolean;
}

export interface OverlapAlert {
  id: string;
  matchA: ResolvedAgendaMatch;
  matchB: ResolvedAgendaMatch;
  gapMinutes: number;
  message: string;
}

export interface SportUserStatus {
  sportId: SportId;
  teamId: string;
  teamName: string;
  eliminatedInRound?: string;
  wonTournament?: boolean;
  unlockedMatchIds: string[];
  activeMatchIds: string[];
}
