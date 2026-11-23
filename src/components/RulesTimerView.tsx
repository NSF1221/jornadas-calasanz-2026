import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Clock,
  Crown,
  Pause,
  Play,
  RotateCcw,
  Scale,
  ShieldAlert,
  Timer,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { SPORT_RULES, SPORTS, SPORTS_BY_ID } from '../data/tournamentData';
import type { SportId } from '../types/tournament';
import { playTapClick, playTimerEndBeep, unlockAudio } from '../utils/audio';
import { SportIcon } from './SportIcon';

const STANDARD_SECONDS = 10 * 60; // 10:00
const CHESS_SECONDS = 5 * 60; // 5:00 per player

function formatClock(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

interface RulesTimerViewProps {
  initialSport?: SportId;
}

export function RulesTimerView({ initialSport = 'baloncesto' }: RulesTimerViewProps) {
  const [timerMode, setTimerMode] = useState<'standard' | 'chess'>('standard');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedRuleSport, setSelectedRuleSport] = useState<SportId>(initialSport);

  // Standard 10:00 match timer state
  const [stdRemaining, setStdRemaining] = useState(STANDARD_SECONDS);
  const [stdRunning, setStdRunning] = useState(false);

  // Chess 5:00 + 5:00 clock state
  const [chessP1, setChessP1] = useState(CHESS_SECONDS);
  const [chessP2, setChessP2] = useState(CHESS_SECONDS);
  const [chessTurn, setChessTurn] = useState<1 | 2 | null>(null);
  const [chessPaused, setChessPaused] = useState(false);

  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;

  // Standard timer tick
  useEffect(() => {
    if (!stdRunning) return;
    const id = window.setInterval(() => {
      setStdRemaining((prev) => {
        if (prev <= 1) {
          setStdRunning(false);
          if (soundRef.current) playTimerEndBeep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [stdRunning]);

  // Chess clock tick
  useEffect(() => {
    if (!chessTurn || chessPaused) return;
    const id = window.setInterval(() => {
      if (chessTurn === 1) {
        setChessP1((prev) => {
          if (prev <= 1) {
            setChessTurn(null);
            if (soundRef.current) playTimerEndBeep();
            return 0;
          }
          return prev - 1;
        });
      } else {
        setChessP2((prev) => {
          if (prev <= 1) {
            setChessTurn(null);
            if (soundRef.current) playTimerEndBeep();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [chessTurn, chessPaused]);

  const handleStdToggle = () => {
    unlockAudio();
    if (stdRemaining === 0) {
      setStdRemaining(STANDARD_SECONDS);
      setStdRunning(true);
      return;
    }
    setStdRunning((r) => !r);
  };

  const handleStdReset = () => {
    setStdRunning(false);
    setStdRemaining(STANDARD_SECONDS);
  };

  const handleChessTap = (player: 1 | 2) => {
    unlockAudio();
    if (chessP1 === 0 || chessP2 === 0) return;
    if (soundRef.current) playTapClick();

    // Tapping your own panel passes the turn to the opponent (like a real chess clock!)
    // If clock hasn't started yet, tapping Player 1 starts Player 2's clock (or starts the opponent).
    if (chessTurn === null) {
      setChessPaused(false);
      setChessTurn(player === 1 ? 2 : 1);
      return;
    }
    if (chessPaused) {
      setChessPaused(false);
      setChessTurn(player === 1 ? 2 : 1);
      return;
    }
    if (chessTurn === player) {
      setChessTurn(player === 1 ? 2 : 1);
    }
  };

  const handleChessReset = () => {
    setChessTurn(null);
    setChessPaused(false);
    setChessP1(CHESS_SECONDS);
    setChessP2(CHESS_SECONDS);
  };

  // Ring geometry for Standard Timer
  const ringRadius = 74;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const stdProgress = stdRemaining / STANDARD_SECONDS;
  const strokeDashoffset = ringCircumference * (1 - stdProgress);
  const isFinalCountdown = stdRemaining <= 30 && stdRemaining > 0;
  const isStdFinished = stdRemaining === 0;

  const activeRule = SPORT_RULES[selectedRuleSport];
  const activeSport = SPORTS_BY_ID[selectedRuleSport];

  return (
    <div className="space-y-5">
      {/* ==================== MATCH TIMER & CHESS CLOCK MODULE ==================== */}
      <section
        aria-label="Cronómetro de partido y reloj de ajedrez"
        className="rounded-3xl bg-white border border-[#E6DEC3] p-4 sm:p-6 shadow-earth"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E35336]/12 text-[#E35336] shrink-0">
              <Timer className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold text-[#231712] leading-tight truncate">
                Cronómetro de Partido
              </h2>
              <p className="text-[11px] sm:text-xs text-[#6E5849] truncate">
                Pitido final automático offline
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              unlockAudio();
              setSoundEnabled((s) => !s);
            }}
            aria-label={soundEnabled ? 'Silenciar aviso sonoro' : 'Activar aviso sonoro'}
            className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-[#F5F5DC] hover:bg-[#F4A460]/25 border border-[#E6DEC3] px-3 py-1.5 text-xs font-bold text-[#A0522D] transition-colors shrink-0 whitespace-nowrap cursor-pointer"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-[#E35336]" aria-hidden="true" />
                <span>Sonido</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-[#6E5849]" aria-hidden="true" />
                <span>Silencio</span>
              </>
            )}
          </button>
        </div>

        {/* Mode Switcher */}
        <div
          role="tablist"
          aria-label="Modo de cronómetro"
          className="mt-4 grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#F5F5DC] border border-[#E6DEC3]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={timerMode === 'standard'}
            onClick={() => setTimerMode('standard')}
            className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              timerMode === 'standard'
                ? 'bg-[#E35336] text-white shadow-sm'
                : 'text-[#6E5849] hover:text-[#231712]'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="sm:hidden">Estándar 10:00</span>
            <span className="hidden sm:inline">Partido Estándar (10:00)</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={timerMode === 'chess'}
            onClick={() => setTimerMode('chess')}
            className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              timerMode === 'chess'
                ? 'bg-[#A0522D] text-white shadow-sm'
                : 'text-[#6E5849] hover:text-[#231712]'
            }`}
          >
            <Crown className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="sm:hidden">Ajedrez 5+5</span>
            <span className="hidden sm:inline">Reloj de Ajedrez (5:00 + 5:00)</span>
          </button>
        </div>

        {/* Standard 10:00 Timer */}
        {timerMode === 'standard' ? (
          <div className="mt-5 flex flex-col items-center">
            <div className="relative flex items-center justify-center">
              <svg className="w-48 h-48 -rotate-90" viewBox="0 0 180 180" aria-hidden="true">
                <circle
                  cx="90"
                  cy="90"
                  r={ringRadius}
                  fill="none"
                  stroke="#F5F5DC"
                  strokeWidth="12"
                />
                <circle
                  cx="90"
                  cy="90"
                  r={ringRadius}
                  fill="none"
                  stroke={isStdFinished || isFinalCountdown ? '#B91C1C' : '#E35336'}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 0.35s linear, stroke 0.2s ease' }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span
                  data-testid="standard-timer-display"
                  className={`text-4xl sm:text-5xl font-extrabold tabular-nums tracking-tight ${
                    isStdFinished || isFinalCountdown ? 'text-[#B91C1C]' : 'text-[#231712]'
                  }`}
                >
                  {formatClock(stdRemaining)}
                </span>
                <span className="mt-1 text-xs font-bold text-[#6E5849]">
                  {isStdFinished
                    ? '¡Tiempo finalizado!'
                    : stdRunning
                      ? 'En curso'
                      : stdRemaining === STANDARD_SECONDS
                        ? 'Listo · 10 min'
                        : 'En pausa'}
                </span>
              </div>
            </div>

            {/* Linear secondary bar */}
            <div className="mt-3 w-full max-w-sm h-2 rounded-full bg-[#F5F5DC] overflow-hidden border border-[#E6DEC3]">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.round(stdProgress * 100)}%`,
                  background:
                    isStdFinished || isFinalCountdown
                      ? '#B91C1C'
                      : 'linear-gradient(90deg, #E35336 0%, #F4A460 100%)',
                }}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 w-full max-w-sm">
              <button
                type="button"
                onClick={handleStdToggle}
                className={`min-h-[52px] inline-flex items-center justify-center gap-2 rounded-2xl text-sm sm:text-base font-extrabold text-white shadow-earth transition-all active:scale-[0.98] cursor-pointer ${
                  stdRunning ? 'bg-[#A0522D] hover:bg-[#8a4525]' : 'bg-[#E35336] hover:bg-[#c9452a]'
                }`}
              >
                {stdRunning ? (
                  <>
                    <Pause className="w-5 h-5" aria-hidden="true" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" aria-hidden="true" />
                    <span>{stdRemaining === 0 ? 'Reiniciar y empezar' : 'Iniciar'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleStdReset}
                className="min-h-[52px] inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5F5DC] hover:bg-[#F4A460]/25 border border-[#E6DEC3] text-[#231712] text-sm sm:text-base font-extrabold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-5 h-5 text-[#A0522D]" aria-hidden="true" />
                <span>Reiniciar</span>
              </button>
            </div>
          </div>
        ) : (
          /* Chess Clock (5:00 + 5:00) */
          <div className="mt-5 space-y-3">
            <p className="text-xs text-[#6E5849] text-center font-semibold">
              Pulsa tu panel al terminar tu jugada para pasar el turno al rival
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Player 1 Panel */}
              <button
                type="button"
                onClick={() => handleChessTap(1)}
                aria-label={`Reloj Jugador 1 Blancas: ${formatClock(chessP1)}`}
                className={`min-h-[140px] rounded-3xl border-2 p-5 flex flex-col items-center justify-center transition-all active:scale-[0.98] cursor-pointer ${
                  chessP1 === 0
                    ? 'bg-[#FEF2F2] border-[#B91C1C] text-[#B91C1C]'
                    : chessTurn === 1 && !chessPaused
                      ? 'bg-[#A0522D] border-[#A0522D] text-white shadow-earth-lg'
                      : 'bg-[#F5F5DC]/75 border-[#E6DEC3] text-[#231712] hover:border-[#A0522D]'
                }`}
              >
                <span
                  className={`text-xs font-extrabold uppercase tracking-wide ${
                    chessTurn === 1 && !chessPaused ? 'text-[#F4A460]' : 'text-[#6E5849]'
                  }`}
                >
                  Jugador 1 · Blancas
                </span>
                <span
                  data-testid="chess-p1-display"
                  className="mt-1.5 text-5xl font-extrabold tabular-nums tracking-tight"
                >
                  {formatClock(chessP1)}
                </span>
                <span
                  className={`mt-2 text-xs font-bold ${
                    chessP1 === 0
                      ? 'text-[#B91C1C]'
                      : chessTurn === 1 && !chessPaused
                        ? 'text-white/95'
                        : 'text-[#6E5849]'
                  }`}
                >
                  {chessP1 === 0
                    ? 'Tiempo agotado'
                    : chessTurn === 1 && !chessPaused
                      ? 'Tu turno · Pulsa al mover'
                      : chessTurn === null
                        ? 'Pulsa para iniciar rival'
                        : 'Esperando'}
                </span>
              </button>

              {/* Player 2 Panel */}
              <button
                type="button"
                onClick={() => handleChessTap(2)}
                aria-label={`Reloj Jugador 2 Negras: ${formatClock(chessP2)}`}
                className={`min-h-[140px] rounded-3xl border-2 p-5 flex flex-col items-center justify-center transition-all active:scale-[0.98] cursor-pointer ${
                  chessP2 === 0
                    ? 'bg-[#FEF2F2] border-[#B91C1C] text-[#B91C1C]'
                    : chessTurn === 2 && !chessPaused
                      ? 'bg-[#E35336] border-[#E35336] text-white shadow-earth-lg'
                      : 'bg-[#F5F5DC]/75 border-[#E6DEC3] text-[#231712] hover:border-[#E35336]'
                }`}
              >
                <span
                  className={`text-xs font-extrabold uppercase tracking-wide ${
                    chessTurn === 2 && !chessPaused ? 'text-[#F5F5DC]' : 'text-[#6E5849]'
                  }`}
                >
                  Jugador 2 · Negras
                </span>
                <span
                  data-testid="chess-p2-display"
                  className="mt-1.5 text-5xl font-extrabold tabular-nums tracking-tight"
                >
                  {formatClock(chessP2)}
                </span>
                <span
                  className={`mt-2 text-xs font-bold ${
                    chessP2 === 0
                      ? 'text-[#B91C1C]'
                      : chessTurn === 2 && !chessPaused
                        ? 'text-white/95'
                        : 'text-[#6E5849]'
                  }`}
                >
                  {chessP2 === 0
                    ? 'Tiempo agotado'
                    : chessTurn === 2 && !chessPaused
                      ? 'Tu turno · Pulsa al mover'
                      : chessTurn === null
                        ? 'Pulsa para iniciar rival'
                        : 'Esperando'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                disabled={chessTurn === null || chessP1 === 0 || chessP2 === 0}
                onClick={() => setChessPaused((p) => !p)}
                className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#A0522D] hover:bg-[#8a4525] disabled:opacity-45 text-white text-sm font-extrabold transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {chessPaused ? (
                  <>
                    <Play className="w-4 h-4" aria-hidden="true" />
                    <span>Reanudar</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4" aria-hidden="true" />
                    <span>Pausar</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleChessReset}
                className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#F5F5DC] hover:bg-[#F4A460]/25 border border-[#E6DEC3] text-[#231712] text-sm font-extrabold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#A0522D]" aria-hidden="true" />
                <span>Reiniciar 5+5</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ==================== SPORT RULES QUICK CARDS ==================== */}
      <section aria-label="Normas modificadas de competición" className="space-y-3.5">
        <div className="px-1">
          <h2 className="text-base sm:text-lg font-extrabold text-[#A0522D]">
            Reglamento rápido y sanciones por modalidad
          </h2>
          <p className="text-xs text-[#6E5849]">
            Selecciona un deporte para consultar duración, saque, desempate y penalizaciones oficiales
          </p>
        </div>

        {/* Sport selector pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {SPORTS.map((sp) => {
            const isActive = sp.id === selectedRuleSport;
            return (
              <button
                key={sp.id}
                type="button"
                onClick={() => setSelectedRuleSport(sp.id)}
                className={`inline-flex items-center gap-1.5 min-h-[40px] rounded-full px-3.5 py-2 text-xs font-bold border whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#E35336] border-[#E35336] text-white shadow-sm'
                    : 'bg-white border-[#E6DEC3] text-[#231712] hover:border-[#F4A460]'
                }`}
              >
                <SportIcon
                  sportId={sp.id}
                  className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#A0522D]'}`}
                />
                <span>{sp.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Rule Card */}
        <article className="rounded-3xl bg-white border border-[#E6DEC3] p-5 sm:p-6 shadow-earth space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E6DEC3]/80">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A0522D]/12 text-[#A0522D]">
                <SportIcon sportId={activeSport.id} className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-[#231712]">{activeSport.name}</h3>
                <p className="text-xs font-semibold text-[#6E5849]">{activeSport.defaultCourt}</p>
              </div>
            </div>
            <span className="rounded-full bg-[#F4A460]/25 px-3 py-1 text-xs font-extrabold text-[#A0522D] tabular-nums">
              {activeSport.scheduleSummary}
            </span>
          </div>

          {activeRule.isOfficialOnly && (
            <div className="rounded-2xl bg-[#F4A460]/20 border border-[#F4A460] p-3.5 text-xs sm:text-sm font-bold text-[#A0522D]">
              Reglamento oficial — confirmar modificaciones con la organización en pista.
            </div>
          )}

          {/* Key rule grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#F5F5DC]/65 border border-[#E6DEC3] p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#A0522D]">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Duración</span>
              </div>
              <p className="mt-1 text-sm font-bold text-[#231712] leading-snug">
                {activeRule.duration}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F5F5DC]/65 border border-[#E6DEC3] p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#A0522D]">
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Jugadores en pista</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-[#231712] leading-snug">
                {activeRule.playersOnCourt}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F5F5DC]/65 border border-[#E6DEC3] p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#A0522D]">
                <Scale className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Saque y orden</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-[#231712] leading-snug">
                {activeRule.serveRule}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F5F5DC]/65 border border-[#E6DEC3] p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#A0522D]">
                <Award className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Desempate</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-[#231712] leading-snug">
                {activeRule.tiebreaker}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#F5F5DC]/45 border border-[#E6DEC3] p-3.5">
            <p className="text-xs font-extrabold text-[#A0522D]">Puntuación</p>
            <p className="mt-1 text-sm font-semibold text-[#231712] leading-relaxed">
              {activeRule.scoring}
            </p>
            {activeRule.extraNotes.length > 0 && (
              <ul className="mt-2.5 space-y-1.5 list-disc list-inside text-xs text-[#6E5849]">
                {activeRule.extraNotes.map((note, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {note}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Highlighted Penalty & Sanction Alert Box */}
          <div className="rounded-2xl bg-[#FEF2F2] border-2 border-[#B91C1C]/35 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#B91C1C]">
              <ShieldAlert className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>Penalizaciones y avisos obligatorios ({activeSport.shortName})</span>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-[#7F1D1D]">
              <div className="rounded-xl bg-white/85 border border-[#B91C1C]/20 p-3">
                <p className="font-extrabold text-[#B91C1C] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Retraso al partido:</span>
                </p>
                <p className="mt-0.5 font-semibold text-[#231712]">{activeRule.latePenalty}</p>
              </div>

              <div className="rounded-xl bg-white/85 border border-[#B91C1C]/20 p-3">
                <p className="font-extrabold text-[#B91C1C]">Mal uso del material:</p>
                <p className="mt-0.5 font-semibold text-[#231712]">
                  {activeRule.materialSanction}
                </p>
              </div>

              <div className="rounded-xl bg-white/85 border border-[#B91C1C]/20 p-3">
                <p className="font-extrabold text-[#B91C1C]">
                  Comunicación del resultado (derrota doble):
                </p>
                <p className="mt-0.5 font-semibold text-[#231712]">
                  {activeRule.communicationRule}
                </p>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
