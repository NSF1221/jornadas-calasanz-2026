import { BookOpenCheck, CalendarCheck2, Map as MapIcon, Trophy } from 'lucide-react';

export type AppTab = 'agenda' | 'brackets' | 'map' | 'rules';

interface BottomNavProps {
  activeTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
  overlapCount: number;
}

const NAV_ITEMS: Array<{
  id: AppTab;
  label: string;
  Icon: typeof CalendarCheck2;
}> = [
  { id: 'agenda', label: 'Mi Agenda', Icon: CalendarCheck2 },
  { id: 'brackets', label: 'Cuadrantes', Icon: Trophy },
  { id: 'map', label: 'Mapa', Icon: MapIcon },
  { id: 'rules', label: 'Normas y Reloj', Icon: BookOpenCheck },
];

export function BottomNav({ activeTab, onChangeTab, overlapCount }: BottomNavProps) {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E6DEC3] pb-safe shadow-[0_-4px_18px_-4px_rgba(160,82,45,0.1)]"
    >
      <div className="mx-auto max-w-5xl grid grid-cols-4 h-16 px-1 sm:px-4">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChangeTab(id)}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center gap-0.5 min-h-[48px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E35336] rounded-xl"
            >
              <span
                className={`relative flex items-center justify-center rounded-full px-4 py-1 transition-all duration-200 ${
                  isActive
                    ? 'bg-[#E35336]/15 text-[#E35336]'
                    : 'text-[#6E5849] hover:text-[#231712]'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.4 : 2} aria-hidden="true" />
                {id === 'agenda' && overlapCount > 0 && (
                  <span
                    aria-label={`${overlapCount} solapamientos`}
                    className="absolute -top-1 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#B91C1C] px-1 text-[10px] font-extrabold text-white tabular-nums"
                  >
                    {overlapCount}
                  </span>
                )}
              </span>
              <span
                className={`text-[11px] leading-tight whitespace-nowrap ${
                  isActive ? 'font-extrabold text-[#E35336]' : 'font-semibold text-[#6E5849]'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
