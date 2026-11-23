import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Camera,
  Clock,
  Compass,
  Info,
  MapPin,
  ShieldCheck,
  Trophy,
  Users,
} from 'lucide-react';
import { MATCHES, MATCHES_BY_ID, SPORTS, SPORTS_BY_ID, TEAMS, TEAMS_BY_ID } from '../data/tournamentData';
import type {
  SportId,
  SportUserStatus,
  Team,
  UserProfile,
  ZoneId,
} from '../types/tournament';
import { resolveBracketMatchForView } from '../utils/tournamentLogic';
import { SportIcon } from './SportIcon';

interface BracketsViewProps {
  selectedSport: SportId;
  onSelectSport: (sportId: SportId) => void;
  userProfile: UserProfile | null;
  sportStatuses: Record<string, SportUserStatus>;
  includeGincana: boolean;
  onToggleGincana: () => void;
  onOpenTeamModal: (team: Team) => void;
  onJumpToZone: (zoneId: ZoneId) => void;
}

export function BracketsView({
  selectedSport,
  onSelectSport,
  userProfile,
  sportStatuses,
  includeGincana,
  onToggleGincana,
  onOpenTeamModal,
  onJumpToZone,
}: BracketsViewProps) {
  const [selectedRoundFilter, setSelectedRoundFilter] = useState<number | 'all'>('all');

  const sport = SPORTS_BY_ID[selectedSport];
  const userSportStatus = sportStatuses[selectedSport];

  const sportMatches = useMemo(
    () => MATCHES.filter((m) => m.sportId === selectedSport),
    [selectedSport]
  );

  const sportTeams = useMemo(
    () => TEAMS.filter((t) => t.sportId === selectedSport),
    [selectedSport]
  );

  const groupedRounds = useMemo(() => {
    return sport.rounds.map((roundName, roundIndex) => ({
      roundIndex,
      roundName,
      matches: sportMatches.filter((m) => m.roundIndex === roundIndex),
      byes: sport.byes.filter((b) => b.roundIndex === roundIndex),
    }));
  }, [sport, sportMatches]);

  const handleSportChange = (id: SportId) => {
    onSelectSport(id);
    setSelectedRoundFilter('all');
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Horizontal scrollable 12-sport pill selector */}
      <div
        role="tablist"
        aria-label="Modalidades deportivas"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {SPORTS.map((item) => {
          const isSelected = item.id === selectedSport;
          const userPlaysSport = Boolean(sportStatuses[item.id]);
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => handleSportChange(item.id)}
              className={`inline-flex items-center gap-2 min-h-[42px] rounded-full px-4 py-2 text-xs sm:text-sm font-bold border whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#E35336] border-[#E35336] text-white shadow-earth'
                  : 'bg-white border-[#E6DEC3] text-[#231712] hover:border-[#F4A460] hover:bg-[#F4A460]/10'
              }`}
            >
              <SportIcon
                sportId={item.id}
                className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#A0522D]'}`}
              />
              <span>{item.shortName}</span>
              {userPlaysSport && (
                <span
                  aria-label="Inscrito"
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-[#E35336]/15 text-[#E35336]'
                  }`}
                >
                  Tú
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sport Header Card */}
      <section className="rounded-2xl bg-white border border-[#E6DEC3] p-4 sm:p-5 shadow-earth">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E35336]/12 text-[#E35336] shrink-0">
                <SportIcon sportId={sport.id} className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#231712] leading-tight">
                  {sport.name}
                </h2>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#6E5849] font-semibold">
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Clock className="w-3.5 h-3.5 text-[#A0522D]" aria-hidden="true" />
                    {sport.scheduleSummary}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#E35336]" aria-hidden="true" />
                    {sport.defaultCourt}
                  </span>
                  {sportTeams.length > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>
                        {sportTeams.length}{' '}
                        {sport.id === 'ajedrez' || sport.id === 'pin-pon' || sport.id === 'tenis'
                          ? 'participantes'
                          : sport.id.startsWith('padel')
                            ? 'parejas'
                            : 'equipos'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onJumpToZone(sport.zoneId)}
            className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-[#F5F5DC] hover:bg-[#F4A460]/25 border border-[#E6DEC3] px-3 py-2 text-xs font-bold text-[#A0522D] transition-colors shrink-0 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Ver en mapa</span>
          </button>
        </div>

        {sport.updatedNote && (
          <div className="mt-3.5 rounded-xl bg-[#F4A460]/20 border border-[#F4A460] px-3.5 py-2.5 flex items-start gap-2 text-xs font-semibold text-[#231712]">
            <AlertCircle className="w-4 h-4 text-[#A0522D] shrink-0 mt-0.5" aria-hidden="true" />
            <span>{sport.updatedNote}</span>
          </div>
        )}

        {/* Round Filter Pills (for multi-round knockout brackets) */}
        {sport.format === 'knockout' && sport.rounds.length > 1 && (
          <div className="mt-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <button
              type="button"
              onClick={() => setSelectedRoundFilter('all')}
              className={`min-h-[36px] rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                selectedRoundFilter === 'all'
                  ? 'bg-[#A0522D] text-white'
                  : 'bg-[#F5F5DC]/80 text-[#6E5849] hover:text-[#231712]'
              }`}
            >
              Todas las rondas
            </button>
            {sport.rounds.map((rName, idx) => (
              <button
                key={rName}
                type="button"
                onClick={() => setSelectedRoundFilter(idx)}
                className={`min-h-[36px] rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  selectedRoundFilter === idx
                    ? 'bg-[#A0522D] text-white'
                    : 'bg-[#F5F5DC]/80 text-[#6E5849] hover:text-[#231712]'
                }`}
              >
                {rName}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Special View: GINCANA */}
      {sport.format === 'activity' && (
        <section className="rounded-2xl bg-white border border-[#E6DEC3] p-5 sm:p-6 shadow-earth space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center rounded-2xl bg-[#E35336] text-white px-4 py-2.5 tabular-nums">
                <span className="text-xl font-extrabold leading-none">13:00</span>
                <span className="text-[11px] font-bold text-white/90 mt-1">a 14:00</span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#231712]">
                  Recorrido de Pruebas · Zona 2
                </h3>
                <p className="text-xs text-[#6E5849]">
                  Actividad abierta por equipos sin cuadro eliminatorio
                </p>
              </div>
            </div>

            {userProfile && (
              <button
                type="button"
                onClick={onToggleGincana}
                className={`min-h-[44px] inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold border transition-colors cursor-pointer ${
                  includeGincana
                    ? 'bg-[#2E7D4F] border-[#2E7D4F] text-white'
                    : 'bg-[#E35336] border-[#E35336] text-white hover:bg-[#c9452a]'
                }`}
              >
                <Compass className="w-4 h-4" aria-hidden="true" />
                <span>{includeGincana ? 'En Mi Agenda (13:00–14:00)' : 'Añadir a Mi Agenda'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#F5F5DC]/70 border border-[#E6DEC3] p-4">
              <p className="text-xs font-extrabold text-[#A0522D]">Fórmula de puntuación</p>
              <p className="mt-1.5 text-sm font-extrabold text-[#231712]">
                Tiempo empleado − número de puntos obtenidos
              </p>
              <p className="mt-1 text-xs text-[#6E5849]">
                Cada prueba vale un máximo de 0,5 puntos evaluados por el organizador según las evidencias.
              </p>
            </div>

            <div className="rounded-2xl bg-[#F5F5DC]/70 border border-[#E6DEC3] p-4">
              <p className="text-xs font-extrabold text-[#A0522D] inline-flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Validación obligatoria</span>
              </p>
              <p className="mt-1.5 text-sm font-bold text-[#231712]">
                Foto o vídeo por cada prueba completada
              </p>
              <p className="mt-1 text-xs text-[#6E5849]">
                Si un equipo hace trampas queda eliminado. Cada minuto de retraso suma +1 minuto al tiempo final.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Special Header Info for Balonmano League */}
      {sport.format === 'league' && (
        <section className="rounded-2xl bg-white border border-[#E6DEC3] p-4 sm:p-5 shadow-earth">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-extrabold text-[#A0522D]">
              Equipos participantes (pulsa para ver jugadores)
            </h3>
            <span className="text-xs font-semibold text-[#6E5849]">
              Victoria 3 pts · Empate 1 pt · Derrota 0 pts
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {sportTeams.map((team) => {
              const isUserTeam = Boolean(userProfile?.teamIds.includes(team.id));
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => onOpenTeamModal(team)}
                  className={`min-h-[54px] rounded-xl border p-3 text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isUserTeam
                      ? 'bg-[#F4A460]/20 border-[#E35336] ring-1 ring-[#E35336]/20'
                      : 'bg-[#F5F5DC]/55 border-[#E6DEC3] hover:bg-[#F4A460]/15'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-[#231712] truncate">{team.name}</p>
                    <p className="text-xs text-[#6E5849]">{team.players.length} integrantes</p>
                  </div>
                  <Users className="w-4 h-4 text-[#A0522D] shrink-0" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Rounds & Matches */}
      {sport.format !== 'activity' && (
        <div className="space-y-5">
          {groupedRounds
            .filter((r) => selectedRoundFilter === 'all' || r.roundIndex === selectedRoundFilter)
            .map((round) => (
              <section key={round.roundName} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-[#A0522D]">
                      {round.roundName}
                    </h3>
                    {round.roundName === 'Final' && (
                      <Trophy className="w-4 h-4 text-[#E35336]" aria-hidden="true" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-[#6E5849] tabular-nums">
                    {round.matches.length} {round.matches.length === 1 ? 'partido' : 'partidos'}
                  </span>
                </div>

                {/* Matches Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {round.matches.map((match) => {
                    const resolved = resolveBracketMatchForView(match, userProfile, userSportStatus);
                    const homeTeam = resolved.home.teamId ? TEAMS_BY_ID[resolved.home.teamId] : undefined;
                    const awayTeam = resolved.away.teamId ? TEAMS_BY_ID[resolved.away.teamId] : undefined;
                    const courtLabel = match.court ?? sport.defaultCourt;

                    return (
                      <article
                        key={match.id}
                        className={`rounded-2xl border p-3.5 sm:p-4 transition-all shadow-earth ${
                          resolved.isUserMatch
                            ? 'bg-[#F4A460]/15 border-[#E35336] ring-1 ring-[#A0522D]/20'
                            : match.isFinal
                              ? 'bg-white border-[#A0522D]/60'
                              : 'bg-white border-[#E6DEC3]'
                        }`}
                      >
                        {/* Match Top Bar */}
                        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E6DEC3]/75">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-extrabold tabular-nums ${
                                match.isFinal
                                  ? 'bg-[#A0522D] text-white'
                                  : resolved.isUserMatch
                                    ? 'bg-[#E35336] text-white'
                                    : 'bg-[#231712] text-[#F5F5DC]'
                              }`}
                            >
                              {match.displayCode}
                            </span>
                            {resolved.isUserMatch && (
                              <span className="text-[11px] font-extrabold text-[#E35336]">
                                Tu cruce
                              </span>
                            )}
                          </div>

                          <span className="inline-flex items-center gap-1 rounded-full bg-[#F4A460]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#A0522D] max-w-[190px] truncate">
                            <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                            <span className="truncate">{courtLabel}</span>
                          </span>
                        </div>

                        {/* Home vs Away */}
                        <div className="mt-3 space-y-2">
                          {/* Home (Local) */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              {homeTeam ? (
                                <button
                                  type="button"
                                  onClick={() => onOpenTeamModal(homeTeam)}
                                  className={`text-left text-sm font-extrabold leading-snug hover:text-[#E35336] transition-colors cursor-pointer ${
                                    resolved.home.isUserTeam ? 'text-[#E35336]' : 'text-[#231712]'
                                  }`}
                                >
                                  {resolved.home.label}
                                </button>
                              ) : (
                                <span className="text-sm font-semibold text-[#6E5849]">
                                  {resolved.home.label}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-[#6E5849] bg-[#F5F5DC] border border-[#E6DEC3] rounded-md px-1.5 py-0.5 shrink-0">
                              Local · Saca
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="h-px flex-1 bg-[#E6DEC3]/75" />
                            <span className="text-[10px] font-extrabold text-[#A0522D] uppercase">
                              vs
                            </span>
                            <div className="h-px flex-1 bg-[#E6DEC3]/75" />
                          </div>

                          {/* Away */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              {awayTeam ? (
                                <button
                                  type="button"
                                  onClick={() => onOpenTeamModal(awayTeam)}
                                  className={`text-left text-sm font-extrabold leading-snug hover:text-[#E35336] transition-colors cursor-pointer ${
                                    resolved.away.isUserTeam ? 'text-[#E35336]' : 'text-[#231712]'
                                  }`}
                                >
                                  {resolved.away.label}
                                </button>
                              ) : (
                                <span className="text-sm font-semibold text-[#6E5849]">
                                  {resolved.away.label}
                                </span>
                              )}
                            </div>
                            {awayTeam && (
                              <span className="text-[10px] font-semibold text-[#6E5849] shrink-0">
                                Ver equipo
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Special Bye Cards ("No juega en esta ronda") */}
                {round.byes.length > 0 && (
                  <div className="space-y-2">
                    {round.byes.map((bye, idx) => {
                      const byeTeam =
                        bye.slot.type === 'team' ? TEAMS_BY_ID[bye.slot.teamId] : undefined;
                      const byeSrcMatch =
                        bye.slot.type === 'winnerOf' ? MATCHES_BY_ID[bye.slot.matchId] : undefined;
                      const isUserBye = Boolean(
                        (byeTeam && userProfile?.teamIds.includes(byeTeam.id)) ||
                          (byeSrcMatch && userSportStatus?.unlockedMatchIds.includes(byeSrcMatch.id))
                      );
                      const label = byeTeam
                        ? byeTeam.name
                        : byeSrcMatch
                          ? `Ganador de ${byeSrcMatch.displayCode}`
                          : 'Por confirmar';

                      return (
                        <div
                          key={`${round.roundIndex}-bye-${idx}`}
                          className={`rounded-2xl border p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 ${
                            isUserBye
                              ? 'bg-[#F4A460]/20 border-[#E35336]'
                              : 'bg-[#F5F5DC]/80 border-[#E6DEC3]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A0522D]/15 text-[#A0522D] shrink-0">
                              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] font-extrabold text-[#A0522D] uppercase tracking-wide">
                                  No juega en esta ronda
                                </span>
                              </div>
                              {byeTeam ? (
                                <button
                                  type="button"
                                  onClick={() => onOpenTeamModal(byeTeam)}
                                  className="text-sm font-extrabold text-[#231712] hover:text-[#E35336] underline decoration-[#F4A460] underline-offset-2 text-left cursor-pointer"
                                >
                                  {label}
                                </button>
                              ) : (
                                <p className="text-sm font-extrabold text-[#231712]">{label}</p>
                              )}
                              {bye.note && (
                                <p className="text-xs text-[#6E5849] mt-0.5">{bye.note}</p>
                              )}
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-1 rounded-full bg-white border border-[#E6DEC3] px-3 py-1 text-xs font-bold text-[#A0522D] shrink-0">
                            <Info className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Pase directo</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            ))}
        </div>
      )}
    </div>
  );
}
