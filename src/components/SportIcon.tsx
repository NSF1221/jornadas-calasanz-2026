import {
  Activity,
  CircleDot,
  Compass,
  Crown,
  Dumbbell,
  Flame,
  Hand,
  Medal,
  Shield,
  Target,
  Trophy,
  Volleyball,
} from 'lucide-react';
import type { SportId } from '../types/tournament';

interface SportIconProps {
  sportId: SportId;
  className?: string;
}

export function SportIcon({ sportId, className = 'w-4 h-4' }: SportIconProps) {
  switch (sportId) {
    case 'ajedrez':
      return <Crown className={className} aria-hidden="true" />;
    case 'balon-tiro':
      return <Target className={className} aria-hidden="true" />;
    case 'baloncesto':
      return <Flame className={className} aria-hidden="true" />;
    case 'balonmano':
      return <Hand className={className} aria-hidden="true" />;
    case 'futbol-7':
      return <Shield className={className} aria-hidden="true" />;
    case 'padel-femenino':
      return <Medal className={className} aria-hidden="true" />;
    case 'padel-masculino':
      return <Trophy className={className} aria-hidden="true" />;
    case 'padel-mixto':
      return <Activity className={className} aria-hidden="true" />;
    case 'pin-pon':
      return <CircleDot className={className} aria-hidden="true" />;
    case 'tenis':
      return <Dumbbell className={className} aria-hidden="true" />;
    case 'voleibol':
      return <Volleyball className={className} aria-hidden="true" />;
    case 'gincana':
      return <Compass className={className} aria-hidden="true" />;
    default:
      return <Trophy className={className} aria-hidden="true" />;
  }
}
