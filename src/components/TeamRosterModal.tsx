import { useEffect } from 'react';
import { MapPin, User, Users, X, ArrowRight } from 'lucide-react';
import { SPORTS_BY_ID } from '../data/tournamentData';
import type { Team } from '../types/tournament';
import { SportIcon } from './SportIcon';

interface TeamRosterModalProps {
  team: Team | null;
  onClose: () => void;
  onSelectPlayerAsProfile: (playerName: string) => void;
  onSelectTeamAsProfile: (team: Team) => void;
}

export function TeamRosterModal({
  team,
  onClose,
  onSelectPlayerAsProfile,
  onSelectTeamAsProfile,
}: TeamRosterModalProps) {
  useEffect(() => {
    if (!team) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [team, onClose]);

  if (!team) return null;

  const sport = SPORTS_BY_ID[team.sportId];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="roster-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#231712]/55 backdrop-blur-xs sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white border border-[#E6DEC3] shadow-earth-lg max-h-[85dvh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile grab handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-[#E6DEC3]" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-3 sm:pt-5 pb-4 border-b border-[#E6DEC3]/80">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#A0522D]">
              <SportIcon sportId={team.sportId} className="w-3.5 h-3.5 shrink-0" />
              <span>{sport.name}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#6E5849] font-semibold">
                {team.players.length} {team.players.length === 1 ? 'participante' : 'integrantes'}
              </span>
            </div>
            <h3
              id="roster-modal-title"
              className="mt-1 text-lg sm:text-xl font-extrabold text-[#231712] leading-snug"
            >
              {team.name}
            </h3>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#6E5849]">
              <MapPin className="w-3.5 h-3.5 text-[#E35336] shrink-0" aria-hidden="true" />
              <span>{sport.defaultCourt}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar listado de jugadores"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#6E5849] hover:bg-[#F5F5DC] transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roster List */}
        <div className="overflow-y-auto px-5 py-4 flex-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#6E5849] mb-3">
            <Users className="w-4 h-4 text-[#A0522D]" aria-hidden="true" />
            <span>Integrantes inscritos (pulsa un nombre para ver su agenda)</span>
          </div>
          <ul className="space-y-2">
            {team.players.map((player, idx) => (
              <li key={`${player}-${idx}`}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectPlayerAsProfile(player);
                    onClose();
                  }}
                  className="w-full min-h-[44px] flex items-center justify-between gap-3 rounded-xl bg-[#F5F5DC]/60 hover:bg-[#F4A460]/20 border border-[#E6DEC3] px-3.5 py-2.5 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-[#E6DEC3] text-[#A0522D] text-xs font-bold tabular-nums shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-[#231712] truncate">
                      {player}
                    </span>
                  </div>
                  <ArrowRight
                    className="w-4 h-4 text-[#6E5849] group-hover:text-[#E35336] shrink-0 transition-colors"
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer CTA */}
        <div className="border-t border-[#E6DEC3] bg-[#F5F5DC]/40 px-5 py-3.5 pb-safe flex flex-col sm:flex-row gap-2">
          {team.players.length > 1 && (
            <button
              type="button"
              onClick={() => {
                onSelectTeamAsProfile(team);
                onClose();
              }}
              className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#E35336] hover:bg-[#c9452a] text-white text-sm font-bold px-4 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4" aria-hidden="true" />
              <span>Seguir a este equipo</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-xl bg-white hover:bg-[#F5F5DC] border border-[#E6DEC3] text-[#231712] text-sm font-bold px-4 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
