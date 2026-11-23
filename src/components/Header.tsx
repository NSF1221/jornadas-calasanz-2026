import { MapPin, Search, UserCheck } from 'lucide-react';
import type { UserProfile } from '../types/tournament';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  profile: UserProfile | null;
  onProfileClick: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function Header({ profile, onProfileClick }: HeaderProps) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-[#A0522D] via-[#B84E2F] to-[#E35336] text-white shadow-earth">
      {/* Subtle clay-court geometric lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            'radial-gradient(circle at 88% 20%, #F4A460 0%, transparent 48%), linear-gradient(90deg, rgba(245,245,220,0.22) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 48px 48px',
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight leading-tight text-[#FFFFFF]">
              Jornadas Deportivas José de Calasanz 2026
            </h1>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#F5F5DC]/95">
              <MapPin className="w-3.5 h-3.5 text-[#F4A460] shrink-0" aria-hidden="true" />
              <span className="truncate">CDSCM Melilla · La Hípica</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton />

            <button
              type="button"
              onClick={onProfileClick}
              aria-label={
                profile
                  ? `Perfil activo: ${profile.displayName}. Pulsar para ver o cambiar perfil`
                  : 'Buscar mi perfil de alumno o equipo'
              }
              className="inline-flex items-center gap-2 min-h-[44px] rounded-2xl bg-white/15 hover:bg-white/25 active:scale-[0.98] border border-white/25 px-3 py-1.5 text-left transition-all cursor-pointer"
            >
              {profile ? (
                <>
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#F5F5DC] text-[#A0522D] text-xs font-extrabold shrink-0">
                    {getInitials(profile.displayName)}
                  </span>
                  <span className="hidden sm:block max-w-[140px] truncate text-xs font-bold text-white">
                    {profile.displayName}
                  </span>
                  <UserCheck className="w-4 h-4 text-[#F4A460] sm:hidden shrink-0" aria-hidden="true" />
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-[#F5F5DC] shrink-0" aria-hidden="true" />
                  <span className="text-xs font-bold text-white whitespace-nowrap">Mi perfil</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
