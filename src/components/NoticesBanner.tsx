import { useState } from 'react';
import { ChevronDown, ChevronUp, Megaphone, ArrowUpRight } from 'lucide-react';
import { ORGANIZATION_NOTICES, SPORTS_BY_ID } from '../data/tournamentData';
import type { SportId } from '../types/tournament';

interface NoticesBannerProps {
  onJumpToSport: (sportId: SportId) => void;
}

export function NoticesBanner({ onJumpToSport }: NoticesBannerProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      aria-label="Avisos de última hora de la organización"
      className="w-full mx-auto max-w-5xl px-4 sm:px-6 pt-3 sm:pt-4"
    >
      <div className="rounded-2xl bg-[#F4A460]/20 border border-[#F4A460] overflow-hidden shadow-earth">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-controls="org-notices-panel"
          className="w-full min-h-[48px] flex items-center justify-between gap-2.5 px-3.5 sm:px-4 py-3 text-left hover:bg-[#F4A460]/15 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#A0522D]/15 text-[#A0522D] shrink-0">
              <Megaphone className="w-4 h-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-extrabold text-[#231712] whitespace-nowrap">
                  Avisos de última hora
                </span>
                <span className="inline-flex items-center rounded-full bg-[#A0522D] px-2.5 py-0.5 text-[11px] font-bold text-white tabular-nums whitespace-nowrap">
                  {ORGANIZATION_NOTICES.length} avisos importantes
                </span>
              </div>
              {!expanded && (
                <p className="text-xs text-[#6E5849] truncate mt-0.5">
                  Cambio de pista Fútbol 7/Balonmano · Nuevo horario Pádel Mixto · Pistas Baloncesto 3x3 · Final Pádel Fem.
                </p>
              )}
            </div>
          </div>

          <span className="flex h-8 w-8 items-center justify-center rounded-xl text-[#A0522D] shrink-0">
            {expanded ? (
              <ChevronUp className="w-5 h-5" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-5 h-5" aria-hidden="true" />
            )}
          </span>
        </button>

        {expanded && (
          <div id="org-notices-panel" className="border-t border-[#F4A460]/60 bg-white/85 px-4 py-3.5">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ORGANIZATION_NOTICES.map((notice, idx) => (
                <li
                  key={notice.id}
                  className="rounded-xl bg-[#F5F5DC]/65 border border-[#E6DEC3] p-3 flex flex-col justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#E35336] text-white text-xs font-extrabold tabular-nums shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-[#A0522D] leading-snug">
                        {notice.title}
                      </p>
                      <p className="mt-1 text-xs text-[#231712] leading-relaxed">
                        {notice.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pl-8">
                    {notice.sportIds.map((sportId) => (
                      <button
                        key={sportId}
                        type="button"
                        onClick={() => onJumpToSport(sportId)}
                        className="inline-flex items-center gap-1 rounded-lg bg-white hover:bg-[#F4A460]/25 border border-[#E6DEC3] px-2.5 py-1 text-[11px] font-bold text-[#A0522D] transition-colors cursor-pointer"
                      >
                        <span>Ver {SPORTS_BY_ID[sportId].shortName}</span>
                        <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
