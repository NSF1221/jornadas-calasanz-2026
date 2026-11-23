import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookmarkCheck,
  Camera,
  Check,
  Clock,
  Compass,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Trophy,
  User,
  Users,
  X,
} from 'lucide-react';
import { SPORTS_BY_ID, TEAMS_BY_ID } from '../data/tournamentData';
import type {
  MatchOutcome,
  OverlapAlert,
  ParticipantSearchItem,
  ResolvedAgendaMatch,
  SportId,
  SportUserStatus,
  Team,
  UserProfile,
  ZoneId,
} from '../types/tournament';
import { profileFromSearchItem, searchParticipants } from '../utils/tournamentLogic';
import { SportIcon } from './SportIcon';

interface AgendaViewProps {
  profile: UserProfile | null;
  isEditingProfile: boolean;
  onStartEditProfile: () => void;
  onCancelEditProfile: () => void;
  onSaveProfile: (profile: UserProfile) => void;
  matches: ResolvedAgendaMatch[];
  overlaps: OverlapAlert[];
  sportStatuses: Record<string, SportUserStatus>;
  includeGincana: boolean;
  onToggleGincana: () => void;
  onSelectOutcome: (match: ResolvedAgendaMatch, outcome: MatchOutcome) => void;
  onOpenTeamModal: (team: Team) => void;
  onJumpToSport: (sportId: SportId) => void;
  onJumpToZone: (zoneId: ZoneId) => void;
}

export function AgendaView({
  profile,
  isEditingProfile,
  onStartEditProfile,
  onCancelEditProfile,
  onSaveProfile,
  matches,
  overlaps,
  sportStatuses,
  includeGincana,
  onToggleGincana,
  onSelectOutcome,
  onOpenTeamModal,
  onJumpToSport,
  onJumpToZone,
}: AgendaViewProps) {
  const [query, setQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<ParticipantSearchItem | null>(null);

  const suggestions = useMemo(() => searchParticipants(query, 14), [query]);

  const showOnboarding = !profile || isEditingProfile;

  const overlappingMatchIds = useMemo(() => {
    const ids = new Set<string>();
    for (const alert of overlaps) {
      ids.add(alert.matchA.matchId);
      ids.add(alert.matchB.matchId);
    }
    return ids;
  }, [overlaps]);

  const handleConfirmCandidate = (candidate: ParticipantSearchItem) => {
    onSaveProfile(profileFromSearchItem(candidate));
    setQuery('');
    setSelectedCandidate(null);
  };

  if (showOnboarding) {
    return (
      <div className="space-y-5">
        <div className="rounded-3xl bg-white border border-[#E6DEC3] p-5 sm:p-8 shadow-earth">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold text-[#E35336] tracking-wide">
                Agenda personal offline
              </p>
              <h2 className="mt-1 text-xl sm:text-2xl font-extrabold text-[#231712] leading-tight">
                {profile ? 'Cambiar perfil activo' : 'Encuentra tus partidos al instante'}
              </h2>
              <p className="mt-1.5 text-sm text-[#6E5849] leading-relaxed max-w-2xl">
                Escribe tu nombre (sin preocuparte por tildes ni mayúsculas) o el nombre de tu equipo.
                Guardaremos tu perfil solo en este dispositivo para calcular tu horario, tus pistas y posibles solapamientos.
              </p>
            </div>
            {profile && (
              <button
                type="button"
                onClick={onCancelEditProfile}
                aria-label="Cancelar cambio de perfil"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#6E5849] hover:bg-[#F5F5DC] transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search input */}
          <div className="mt-5">
            <label htmlFor="participant-search" className="sr-only">
              Buscar alumno o equipo
            </label>
            <div className="relative">
              <Search
                className="w-5 h-5 text-[#A0522D] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="participant-search"
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedCandidate(null);
                }}
                placeholder="Ej. Lucía Prieto, Nasser, Genuine FC, Los Palerdos..."
                autoComplete="off"
                className="w-full min-h-[52px] rounded-2xl bg-[#F5F5DC]/60 border-2 border-[#E6DEC3] focus:border-[#E35336] focus:bg-white pl-12 pr-11 py-3 text-base font-semibold text-[#231712] placeholder:text-[#6E5849]/75 focus:outline-none transition-colors"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSelectedCandidate(null);
                  }}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl text-[#6E5849] hover:bg-[#E6DEC3]/50 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Selected candidate confirmation card */}
          {selectedCandidate && (
            <div className="mt-4 rounded-2xl bg-[#F4A460]/15 border-2 border-[#E35336] p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#A0522D]">
                    {selectedCandidate.kind === 'player' ? (
                      <User className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : (
                      <Users className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                    <span>
                      {selectedCandidate.kind === 'player' ? 'Participante seleccionado' : 'Equipo seleccionado'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-lg font-extrabold text-[#231712]">
                    {selectedCandidate.displayName}
                  </p>
                  <p className="text-xs text-[#6E5849] mt-0.5">{selectedCandidate.subtitle}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {selectedCandidate.teamIds.map((tid) => {
                  const t = TEAMS_BY_ID[tid];
                  if (!t) return null;
                  const sp = SPORTS_BY_ID[t.sportId];
                  return (
                    <span
                      key={tid}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-[#E6DEC3] px-2.5 py-1 text-xs font-semibold text-[#231712]"
                    >
                      <SportIcon sportId={t.sportId} className="w-3.5 h-3.5 text-[#E35336]" />
                      <span className="font-bold text-[#A0522D]">{sp.shortName}:</span>
                      <span className="truncate max-w-[180px]">{t.name}</span>
                    </span>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => handleConfirmCandidate(selectedCandidate)}
                className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#E35336] hover:bg-[#c9452a] active:scale-[0.99] text-white font-extrabold text-sm shadow-earth transition-all cursor-pointer"
              >
                <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
                <span>Guardar como mi perfil</span>
              </button>
            </div>
          )}

          {/* Suggestions list */}
          {query.trim().length > 0 && (
            <div className="mt-4">
              {suggestions.length === 0 ? (
                <div className="rounded-2xl bg-[#F5F5DC]/60 border border-[#E6DEC3] p-5 text-center">
                  <p className="text-sm font-bold text-[#231712]">
                    No encontramos coincidencias para “{query}”
                  </p>
                  <p className="mt-1 text-xs text-[#6E5849]">
                    Prueba con solo tu primer nombre, un apellido o el nombre de tu equipo.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-[#6E5849] mb-2">
                    Resultados ({suggestions.length}) · Pulsa para seleccionar
                  </p>
                  <ul className="space-y-2 max-h-[380px] overflow-y-auto pr-0.5">
                    {suggestions.map((item) => {
                      const isPicked = selectedCandidate?.id === item.id;
                      return (
                        <li key={item.id}>
                          <div
                            className={`rounded-2xl border transition-all flex items-center justify-between gap-2 p-2.5 sm:p-3 ${
                              isPicked
                                ? 'bg-[#F4A460]/20 border-[#E35336]'
                                : 'bg-white hover:bg-[#F5F5DC]/70 border-[#E6DEC3]'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedCandidate(item)}
                              className="flex-1 min-w-0 min-h-[44px] flex items-center gap-3 text-left cursor-pointer"
                            >
                              <span
                                className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                                  item.kind === 'player'
                                    ? 'bg-[#E35336]/12 text-[#E35336]'
                                    : 'bg-[#A0522D]/12 text-[#A0522D]'
                                }`}
                              >
                                {item.kind === 'player' ? (
                                  <User className="w-4 h-4" aria-hidden="true" />
                                ) : (
                                  <Users className="w-4 h-4" aria-hidden="true" />
                                )}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-extrabold text-[#231712] truncate">
                                  {item.displayName}
                                </p>
                                <p className="text-xs text-[#6E5849] truncate">{item.subtitle}</p>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleConfirmCandidate(item)}
                              aria-label={`Guardar ${item.displayName} como mi perfil`}
                              className="min-h-[40px] rounded-xl bg-[#E35336] hover:bg-[#c9452a] text-white text-xs font-bold px-3 py-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                            >
                              Elegir
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Empty state helpful summary */}
          {query.trim().length === 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-[#F5F5DC]/65 border border-[#E6DEC3] p-4">
                <Clock className="w-5 h-5 text-[#E35336]" aria-hidden="true" />
                <h3 className="mt-2 text-sm font-extrabold text-[#231712]">Horario unificado</h3>
                <p className="mt-1 text-xs text-[#6E5849] leading-relaxed">
                  Todos tus partidos ordenados cronológicamente con pista exacta y alerta de solapamientos.
                </p>
              </div>
              <div className="rounded-2xl bg-[#F5F5DC]/65 border border-[#E6DEC3] p-4">
                <Trophy className="w-5 h-5 text-[#A0522D]" aria-hidden="true" />
                <h3 className="mt-2 text-sm font-extrabold text-[#231712]">Avance automático</h3>
                <p className="mt-1 text-xs text-[#6E5849] leading-relaxed">
                  Marca «He ganado» para desbloquear al instante tu próximo cruce, hora y pista.
                </p>
              </div>
              <div className="rounded-2xl bg-[#F5F5DC]/65 border border-[#E6DEC3] p-4">
                <MapPin className="w-5 h-5 text-[#2E7D4F]" aria-hidden="true" />
                <h3 className="mt-2 text-sm font-extrabold text-[#231712]">100% local y offline</h3>
                <p className="mt-1 text-xs text-[#6E5849] leading-relaxed">
                  Funciona sin cobertura en La Hípica guardando tu progreso únicamente en tu móvil.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Active Profile Summary Card */}
      <section
        aria-label="Resumen de perfil activo"
        className="rounded-2xl bg-white border border-[#E6DEC3] p-4 sm:p-5 shadow-earth"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold text-[#A0522D]">
              {profile.kind === 'player' ? (
                <User className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>{profile.kind === 'player' ? 'Mi perfil de participante' : 'Equipo seguido'}</span>
            </div>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-extrabold text-[#231712] leading-tight">
              {profile.displayName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onStartEditProfile}
            className="inline-flex items-center gap-1.5 min-h-[40px] rounded-xl bg-[#F5F5DC] hover:bg-[#F4A460]/25 border border-[#E6DEC3] px-3.5 py-2 text-xs font-bold text-[#A0522D] transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Cambiar perfil</span>
          </button>
        </div>

        {/* Enrolled teams/sports chips */}
        <div className="mt-3.5 flex flex-wrap gap-2">
          {profile.teamIds.map((tid) => {
            const team = TEAMS_BY_ID[tid];
            if (!team) return null;
            const sport = SPORTS_BY_ID[team.sportId];
            const status = sportStatuses[team.sportId];
            return (
              <button
                key={tid}
                type="button"
                onClick={() => onOpenTeamModal(team)}
                className="inline-flex items-center gap-2 min-h-[38px] rounded-xl bg-[#F5F5DC]/75 hover:bg-[#F4A460]/20 border border-[#E6DEC3] px-3 py-1.5 text-xs transition-colors cursor-pointer"
              >
                <SportIcon sportId={team.sportId} className="w-3.5 h-3.5 text-[#E35336] shrink-0" />
                <span className="font-extrabold text-[#A0522D]">{sport.shortName}</span>
                {team.players.length > 1 && (
                  <>
                    <span className="text-[#6E5849]" aria-hidden="true">·</span>
                    <span className="font-semibold text-[#231712] max-w-[165px] truncate">
                      {team.name}
                    </span>
                  </>
                )}
                {status?.wonTournament && (
                  <span className="rounded-md bg-[#2E7D4F] text-white px-1.5 py-0.5 text-[10px] font-bold">
                    Final ganada
                  </span>
                )}
                {status?.eliminatedInRound && (
                  <span className="rounded-md bg-[#6E5849]/15 text-[#6E5849] px-1.5 py-0.5 text-[10px] font-bold">
                    Elim. {status.eliminatedInRound}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Optional Gincana enrollment toggle */}
        <div className="mt-4 pt-3.5 border-t border-[#E6DEC3]/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F4A460]/25 text-[#A0522D] shrink-0">
              <Compass className="w-4 h-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-[#231712]">
                ¿Participas en la Gincana (13:00 – 14:00)?
              </p>
              <p className="text-[11px] text-[#6E5849]">
                Actívala para incluirla en tu agenda y detectar solapamientos con Pádel Mixto o Balonmano.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={includeGincana}
            onClick={onToggleGincana}
            className={`min-h-[40px] inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold border transition-all shrink-0 cursor-pointer ${
              includeGincana
                ? 'bg-[#E35336] border-[#E35336] text-white'
                : 'bg-white border-[#E6DEC3] text-[#231712] hover:bg-[#F5F5DC]'
            }`}
          >
            <span>{includeGincana ? 'Incluida en agenda' : 'Añadir Gincana'}</span>
          </button>
        </div>
      </section>

      {/* Overlap Alert Banner */}
      {overlaps.length > 0 && (
        <section
          role="alert"
          aria-label="Solapamientos detectados"
          className="rounded-2xl bg-[#FEF2F2] border-2 border-[#B91C1C]/45 p-4 shadow-earth"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B91C1C] text-white shrink-0">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-extrabold text-[#B91C1C] tracking-tight">
                SOLAPAMIENTO DETECTADO ({overlaps.length})
              </h3>
              <p className="mt-0.5 text-xs text-[#7F1D1D]">
                Tienes partidos activos separados por menos de 15 minutos o a la misma hora. Avisa con antelación a la organización en pista.
              </p>
              <ul className="mt-2.5 space-y-1.5">
                {overlaps.map((alert) => (
                  <li
                    key={alert.id}
                    className="rounded-xl bg-white/90 border border-[#B91C1C]/20 px-3 py-2 text-xs font-bold text-[#991B1B]"
                  >
                    {alert.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Chronological Timeline */}
      <section aria-label="Línea temporal de mis partidos" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-extrabold text-[#A0522D]">
            Tu línea temporal ({matches.length}{' '}
            {matches.length === 1 ? 'actividad' : 'partidos / actividades'})
          </h3>
          <span className="text-xs font-semibold text-[#6E5849]">Ordenado por hora</span>
        </div>

        <div className="relative space-y-3.5">
          {matches.map((match) => {
            const isOverlapping = overlappingMatchIds.has(match.matchId) && match.outcome !== 'loss';
            const isWon = match.outcome === 'win';
            const isLost = match.outcome === 'loss';
            const isDraw = match.outcome === 'draw';
            const oppTeam = match.opponentTeamId ? TEAMS_BY_ID[match.opponentTeamId] : undefined;

            return (
              <article
                key={match.matchId}
                className={`rounded-2xl bg-white border transition-all shadow-earth overflow-hidden ${
                  isOverlapping
                    ? 'border-[#B91C1C] ring-1 ring-[#B91C1C]/20'
                    : isWon
                      ? 'border-[#2E7D4F]/60'
                      : isLost
                        ? 'border-[#E6DEC3] opacity-80'
                        : 'border-[#A0522D]/35'
                }`}
              >
                <div className="p-4 sm:p-5">
                  {/* Top row: Big time + Sport + Code + Local badge */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex flex-col items-center justify-center rounded-2xl px-3.5 py-2 min-w-[78px] tabular-nums ${
                          isOverlapping
                            ? 'bg-[#B91C1C] text-white'
                            : match.isFinal
                              ? 'bg-[#A0522D] text-white'
                              : 'bg-[#E35336] text-white'
                        }`}
                      >
                        <span className="text-lg sm:text-xl font-extrabold leading-none">
                          {match.time}
                        </span>
                        <span className="mt-1 text-[10px] font-bold text-white/90 whitespace-nowrap">
                          {match.endTime ? `a ${match.endTime}` : match.displayCode}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#A0522D]">
                            <SportIcon sportId={match.sportId} className="w-3.5 h-3.5" />
                            <span>{match.sportName}</span>
                          </span>
                          <span className="text-[#6E5849] text-xs" aria-hidden="true">·</span>
                          <span className="text-xs font-bold text-[#6E5849]">
                            {match.roundName}
                          </span>
                          {match.isFinal && (
                            <span className="rounded-md bg-[#A0522D] text-white px-2 py-0.5 text-[10px] font-extrabold">
                              FINAL
                            </span>
                          )}
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#F4A460]/25 border border-[#F4A460]/60 px-2.5 py-0.5 text-[11px] font-bold text-[#A0522D]">
                            <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                            <span>{match.court}</span>
                          </span>

                          {!match.isGincana && match.isHome && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#E35336]/12 border border-[#E35336]/30 px-2.5 py-0.5 text-[11px] font-extrabold text-[#E35336]">
                              Sacas tú (Local)
                            </span>
                          )}

                          {match.eliminatedLabel && (
                            <span className="inline-flex items-center rounded-full bg-[#6E5849]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#6E5849]">
                              {match.eliminatedLabel}
                            </span>
                          )}

                          {isOverlapping && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF2F2] border border-[#B91C1C]/40 px-2.5 py-0.5 text-[11px] font-extrabold text-[#B91C1C]">
                              <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                              Solapamiento
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Jump Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onJumpToZone(match.zoneId)}
                        className="min-h-[36px] inline-flex items-center gap-1 rounded-xl bg-[#F5F5DC]/80 hover:bg-[#F4A460]/25 border border-[#E6DEC3] px-2.5 py-1.5 text-[11px] font-bold text-[#A0522D] transition-colors cursor-pointer"
                      >
                        <MapPin className="w-3 h-3" aria-hidden="true" />
                        <span>Mapa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onJumpToSport(match.sportId)}
                        className="min-h-[36px] inline-flex items-center gap-1 rounded-xl bg-[#F5F5DC]/80 hover:bg-[#F4A460]/25 border border-[#E6DEC3] px-2.5 py-1.5 text-[11px] font-bold text-[#A0522D] transition-colors cursor-pointer"
                      >
                        <span>Cuadrante</span>
                        <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Matchup Body */}
                  {match.isGincana ? (
                    <div className="mt-3.5 rounded-xl bg-[#F5F5DC]/70 border border-[#E6DEC3] p-3.5 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-extrabold text-[#231712]">
                        <Compass className="w-4 h-4 text-[#E35336]" aria-hidden="true" />
                        <span>Gincana · Recorrido completo (13:00 – 14:00)</span>
                      </div>
                      <p className="text-xs text-[#231712]">
                        <strong className="text-[#A0522D]">Fórmula de puntuación:</strong>{' '}
                        <span className="font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-[#E6DEC3]">
                          Tiempo empleado - puntos obtenidos
                        </span>
                      </p>
                      <p className="text-xs text-[#6E5849] inline-flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-[#A0522D] shrink-0" aria-hidden="true" />
                        <span>
                          Cada prueba vale hasta 0,5 pts y se valida obligatoriamente con foto o vídeo del equipo.
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3.5 rounded-xl bg-[#F5F5DC]/55 border border-[#E6DEC3] p-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-[#6E5849]">Tu equipo</p>
                          <p className="text-sm font-extrabold text-[#231712] truncate">
                            {match.userTeamName}
                          </p>
                        </div>

                        <span className="text-xs font-extrabold text-[#A0522D] shrink-0">vs.</span>

                        <div className="min-w-0 sm:text-right">
                          <div className="flex items-center sm:justify-end gap-1.5">
                            <p className="text-[11px] font-bold text-[#6E5849]">Rival</p>
                            {match.isByeDirectOpponent && (
                              <span className="rounded-md bg-[#2E7D4F]/15 text-[#2E7D4F] px-1.5 py-0.5 text-[10px] font-extrabold">
                                Pase directo confirmado
                              </span>
                            )}
                          </div>
                          {oppTeam ? (
                            <button
                              type="button"
                              onClick={() => onOpenTeamModal(oppTeam)}
                              className="text-sm font-extrabold text-[#A0522D] hover:text-[#E35336] underline decoration-[#F4A460] underline-offset-2 text-left sm:text-right cursor-pointer"
                            >
                              {match.opponentDisplay}
                            </button>
                          ) : (
                            <p className="text-sm font-bold text-[#6E5849]">
                              {match.opponentDisplay}
                            </p>
                          )}
                          {match.opponentOriginSubtitle && (
                            <p className="mt-0.5 text-[11px] text-[#6E5849]">
                              {match.opponentOriginSubtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Outcome Buttons */}
                  {!match.isGincana && (
                    <div className="mt-3.5">
                      {match.format === 'league' ? (
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectOutcome(match, 'win')}
                            aria-pressed={isWon}
                            className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl text-xs sm:text-sm font-extrabold border transition-all cursor-pointer ${
                              isWon
                                ? 'bg-[#2E7D4F] border-[#2E7D4F] text-white shadow-sm'
                                : 'bg-white hover:bg-[#2E7D4F]/10 border-[#E6DEC3] text-[#231712]'
                            }`}
                          >
                            <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>Ganado</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectOutcome(match, 'draw')}
                            aria-pressed={isDraw}
                            className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl text-xs sm:text-sm font-extrabold border transition-all cursor-pointer ${
                              isDraw
                                ? 'bg-[#A0522D] border-[#A0522D] text-white shadow-sm'
                                : 'bg-white hover:bg-[#F4A460]/20 border-[#E6DEC3] text-[#231712]'
                            }`}
                          >
                            <span>Empatado</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectOutcome(match, 'loss')}
                            aria-pressed={isLost}
                            className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl text-xs sm:text-sm font-extrabold border transition-all cursor-pointer ${
                              isLost
                                ? 'bg-[#B91C1C] border-[#B91C1C] text-white shadow-sm'
                                : 'bg-white hover:bg-[#FEF2F2] border-[#E6DEC3] text-[#231712]'
                            }`}
                          >
                            <X className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>Perdido</span>
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => onSelectOutcome(match, 'win')}
                            aria-pressed={isWon}
                            aria-label={`He ganado ${match.sportName} ${match.displayCode}`}
                            className={`min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-extrabold border transition-all cursor-pointer ${
                              isWon
                                ? 'bg-[#2E7D4F] border-[#2E7D4F] text-white shadow-sm'
                                : 'bg-white hover:bg-[#2E7D4F]/10 border-[#E6DEC3] text-[#231712]'
                            }`}
                          >
                            <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>He ganado</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onSelectOutcome(match, 'loss')}
                            aria-pressed={isLost}
                            aria-label={`He perdido ${match.sportName} ${match.displayCode}`}
                            className={`min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-extrabold border transition-all cursor-pointer ${
                              isLost
                                ? 'bg-[#B91C1C] border-[#B91C1C] text-white shadow-sm'
                                : 'bg-white hover:bg-[#FEF2F2] border-[#E6DEC3] text-[#231712]'
                            }`}
                          >
                            <X className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>He perdido</span>
                          </button>
                        </div>
                      )}

                      {match.isFinal && isWon && (
                        <div className="mt-2.5 rounded-xl bg-[#2E7D4F]/12 border border-[#2E7D4F]/30 px-3 py-2 flex items-center gap-2 text-xs font-extrabold text-[#2E7D4F]">
                          <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>¡Enhorabuena! Has completado el cuadro de {match.sportName}. Recuerda comunicarlo a la organización.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
