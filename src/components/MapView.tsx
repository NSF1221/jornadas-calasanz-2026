import { useState } from 'react';
import {
  ArrowRight,
  Clock,
  Info,
  MapPin,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { SPORTS_BY_ID, ZONES } from '../data/tournamentData';
import type { SportId, ZoneId } from '../types/tournament';
import { SportIcon } from './SportIcon';

interface MapViewProps {
  selectedZone: ZoneId;
  onSelectZone: (zoneId: ZoneId) => void;
  onJumpToSport: (sportId: SportId) => void;
}

export function MapView({ selectedZone, onSelectZone, onJumpToSport }: MapViewProps) {
  const [zoom, setZoom] = useState(1);

  const activeZone = ZONES.find((z) => z.id === selectedZone) ?? ZONES[2];

  const handleZoomIn = () => setZoom((z) => Math.min(2.2, Number((z + 0.3).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(1, Number((z - 0.3).toFixed(2))));
  const handleReset = () => setZoom(1);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Interactive SVG Map Card */}
      <section
        aria-label="Mapa interactivo de instalaciones CDSCM Melilla La Hípica"
        className="rounded-2xl bg-white border border-[#E6DEC3] overflow-hidden shadow-earth"
      >
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-[#E6DEC3]/80">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-lg font-extrabold text-[#231712] leading-tight">
              Plano · CDSCM Melilla (La Hípica)
            </h2>
            <p className="text-[11px] sm:text-xs text-[#6E5849] mt-0.5">
              Toca cualquier zona del plano para ver pistas y horarios
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              aria-label="Alejar mapa"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-[#F5F5DC] hover:bg-[#F4A460]/25 disabled:opacity-40 border border-[#E6DEC3] text-[#231712] transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="min-w-[48px] text-center text-xs font-extrabold text-[#A0522D] tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 2.2}
              aria-label="Acercar mapa"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-[#F5F5DC] hover:bg-[#F4A460]/25 disabled:opacity-40 border border-[#E6DEC3] text-[#231712] transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {zoom > 1 && (
              <button
                type="button"
                onClick={handleReset}
                aria-label="Restablecer zoom del mapa"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-[#F5F5DC] hover:bg-[#F4A460]/25 border border-[#E6DEC3] text-[#A0522D] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Zoom Viewport */}
        <div className="relative overflow-auto bg-[#EDE9D5] max-h-[460px] touch-pan-x touch-pan-y">
          <div
            style={{
              width: `${zoom * 100}%`,
              minWidth: zoom > 1 ? `${Math.round(zoom * 620)}px` : '100%',
              transition: 'width 180ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <svg
              viewBox="0 0 900 540"
              className="w-full h-auto block select-none"
              role="img"
              aria-label="Mapa esquemático interactivo del CDSCM Melilla La Hípica con 7 zonas deportivas"
            >
              <defs>
                <linearGradient id="seaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9ED3E8" />
                  <stop offset="100%" stopColor="#6FB3D2" />
                </linearGradient>
                <linearGradient id="turfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B8E5C" />
                  <stop offset="100%" stopColor="#2E7D4F" />
                </linearGradient>
                <pattern id="sandDots" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="4" cy="4" r="1" fill="#A0522D" fillOpacity="0.08" />
                  <circle cx="16" cy="14" r="1" fill="#A0522D" fillOpacity="0.06" />
                </pattern>
              </defs>

              {/* Base Campus Grounds */}
              <rect x="0" y="0" width="900" height="540" fill="#F2EBD5" />
              <rect x="0" y="0" width="900" height="540" fill="url(#sandDots)" />

              {/* Sea & Playa de la Hípica (Top-Right) */}
              <path d="M580,0 L900,0 L900,155 L740,80 Z" fill="url(#seaGrad)" />
              <path d="M555,0 L740,80 L900,155 L900,180 L725,98 L525,0 Z" fill="#E8D7B0" />
              <text
                x="785"
                y="48"
                fill="#1D5B79"
                fontSize="14"
                fontWeight="800"
                textAnchor="middle"
                letterSpacing="0.5"
              >
                MAR MEDITERRÁNEO
              </text>
              <text
                x="780"
                y="68"
                fill="#2E6F8E"
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
              >
                Playa de la Hípica
              </text>

              {/* Surrounding Streets matching PDF 3 */}
              {/* C. Héroes de Alcántara (top-left) */}
              <path
                d="M0,78 L465,0 L495,0 L0,104 Z"
                fill="#D7CCB3"
                stroke="#C2B59B"
                strokeWidth="2"
              />
              <text
                x="235"
                y="45"
                fill="#6E5849"
                fontSize="11"
                fontWeight="700"
                transform="rotate(-10 235 45)"
              >
                C. Héroes de Alcántara
              </text>

              {/* Paseo Playa de la Hípica (top-right diagonal) */}
              <path
                d="M495,0 L900,185 L900,214 L462,14 Z"
                fill="#D7CCB3"
                stroke="#C2B59B"
                strokeWidth="2"
              />
              <text
                x="695"
                y="112"
                fill="#6E5849"
                fontSize="11"
                fontWeight="700"
                transform="rotate(24 695 112)"
              >
                P.º Playa de la Hípica
              </text>

              {/* Carr. N-Nador (left side) */}
              <path
                d="M42,88 L175,540 L146,540 L15,96 Z"
                fill="#D7CCB3"
                stroke="#C2B59B"
                strokeWidth="2"
              />
              <text
                x="92"
                y="340"
                fill="#6E5849"
                fontSize="11"
                fontWeight="700"
                transform="rotate(74 92 340)"
              >
                Carr. N-Nador
              </text>

              {/* Inner CDSCM Avenue */}
              <path
                d="M112,188 L322,160 L726,352 L716,520 L692,520 L702,366 L316,184 L120,210 Z"
                fill="#E2D8C0"
                stroke="#CFC2A6"
                strokeWidth="1.5"
              />

              {/* Green athletic lawns & riding grounds (context from satellite PDF) */}
              <polygon
                points="395,245 505,295 450,418 338,365"
                fill="#C7D7B7"
                stroke="#AFC49D"
                strokeWidth="1.5"
              />
              <polygon
                points="520,304 670,375 612,492 465,425"
                fill="#D9CEB4"
                stroke="#C4B699"
                strokeWidth="1.5"
              />

              {/* Clubhouse & Pools reference */}
              <rect
                x="355"
                y="45"
                width="62"
                height="92"
                rx="8"
                fill="#9BC8DC"
                stroke="#76AAC4"
                strokeWidth="2"
                transform="rotate(20 386 91)"
              />
              <text x="386" y="100" fill="#286480" fontSize="10" fontWeight="700" textAnchor="middle">
                Piscina
              </text>

              <circle cx="715" cy="272" r="24" fill="#9BC8DC" stroke="#76AAC4" strokeWidth="2" />
              <text x="715" y="276" fill="#286480" fontSize="9" fontWeight="700" textAnchor="middle">
                Club
              </text>

              {/* ==================== ZONE 6: ENTRADA ==================== */}
              <g
                role="button"
                tabIndex={0}
                aria-label="Zona 6: Entrada Principal"
                onClick={() => onSelectZone('6')}
                onKeyDown={(e) => e.key === 'Enter' && onSelectZone('6')}
                className="cursor-pointer"
              >
                <circle
                  cx="228"
                  cy="78"
                  r={selectedZone === '6' ? 32 : 28}
                  fill={selectedZone === '6' ? '#E35336' : '#A0522D'}
                  stroke="#FFFFFF"
                  strokeWidth="3.5"
                />
                <text x="228" y="75" fill="#FFFFFF" fontSize="16" fontWeight="800" textAnchor="middle">
                  6
                </text>
                <text x="228" y="91" fill="#F5F5DC" fontSize="9" fontWeight="700" textAnchor="middle">
                  ENTRADA
                </text>
              </g>

              {/* ==================== ZONE 5: AJEDREZ ==================== */}
              <g
                role="button"
                tabIndex={0}
                aria-label="Zona 5: Ajedrez"
                onClick={() => onSelectZone('5')}
                onKeyDown={(e) => e.key === 'Enter' && onSelectZone('5')}
                className="cursor-pointer"
              >
                <rect
                  x="274"
                  y="156"
                  width="76"
                  height="52"
                  rx="12"
                  fill={selectedZone === '5' ? '#E35336' : '#FFFFFF'}
                  stroke={selectedZone === '5' ? '#A0522D' : '#A0522D'}
                  strokeWidth={selectedZone === '5' ? '3.5' : '2.2'}
                />
                <text
                  x="312"
                  y="179"
                  fill={selectedZone === '5' ? '#FFFFFF' : '#A0522D'}
                  fontSize="14"
                  fontWeight="800"
                  textAnchor="middle"
                >
                  5
                </text>
                <text
                  x="312"
                  y="196"
                  fill={selectedZone === '5' ? '#F5F5DC' : '#231712'}
                  fontSize="10"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  Ajedrez
                </text>
              </g>

              {/* ==================== ZONE 7: PIN PON ==================== */}
              <g
                role="button"
                tabIndex={0}
                aria-label="Zona 7: Pin Pon"
                onClick={() => onSelectZone('7')}
                onKeyDown={(e) => e.key === 'Enter' && onSelectZone('7')}
                className="cursor-pointer"
              >
                <rect
                  x="208"
                  y="224"
                  width="72"
                  height="54"
                  rx="12"
                  fill={selectedZone === '7' ? '#E35336' : '#FFFFFF'}
                  stroke="#A0522D"
                  strokeWidth={selectedZone === '7' ? '3.5' : '2.2'}
                />
                <text
                  x="244"
                  y="248"
                  fill={selectedZone === '7' ? '#FFFFFF' : '#A0522D'}
                  fontSize="14"
                  fontWeight="800"
                  textAnchor="middle"
                >
                  7
                </text>
                <text
                  x="244"
                  y="265"
                  fill={selectedZone === '7' ? '#F5F5DC' : '#231712'}
                  fontSize="10"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  Pin Pon
                </text>
              </g>

              {/* ==================== ZONE 2: TENIS / VÓLEY / BALÓN TIRO / GINCANA ==================== */}
              <g
                role="button"
                tabIndex={0}
                aria-label="Zona 2: Tenis, Voleibol, Balón Tiro y Gincana"
                onClick={() => onSelectZone('2')}
                onKeyDown={(e) => e.key === 'Enter' && onSelectZone('2')}
                className="cursor-pointer"
              >
                <rect
                  x="290"
                  y="226"
                  width="112"
                  height="96"
                  rx="14"
                  fill={selectedZone === '2' ? '#E35336' : '#D98E54'}
                  stroke={selectedZone === '2' ? '#231712' : '#A0522D'}
                  strokeWidth={selectedZone === '2' ? '3.5' : '2.2'}
                />
                {/* Court inner line */}
                <rect
                  x="300"
                  y="236"
                  width="92"
                  height="76"
                  rx="8"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeOpacity="0.45"
                  strokeWidth="1.5"
                />
                <line
                  x1="346"
                  y1="236"
                  x2="346"
                  y2="312"
                  stroke="#FFFFFF"
                  strokeOpacity="0.45"
                  strokeWidth="1.5"
                />
                <circle cx="346" cy="256" r="14" fill="#FFFFFF" />
                <text x="346" y="261" fill="#A0522D" fontSize="14" fontWeight="800" textAnchor="middle">
                  2
                </text>
                <text x="346" y="286" fill="#FFFFFF" fontSize="10.5" fontWeight="800" textAnchor="middle">
                  Tenis · Vóley
                </text>
                <text x="346" y="301" fill="#F5F5DC" fontSize="9.5" fontWeight="700" textAnchor="middle">
                  Balón Tiro · Gincana
                </text>
              </g>

              {/* ==================== ZONE 4: BALONCESTO (4.1 & 4.2) ==================== */}
              <g
                role="button"
                tabIndex={0}
                aria-label="Zona 4 Pista 4.1: Baloncesto 3x3"
                onClick={() => onSelectZone('4')}
                onKeyDown={(e) => e.key === 'Enter' && onSelectZone('4')}
                className="cursor-pointer"
              >
                <rect
                  x="196"
                  y="322"
                  width="90"
                  height="62"
                  rx="12"
                  fill={selectedZone === '4' ? '#E35336' : '#F4A460'}
                  stroke="#A0522D"
                  strokeWidth={selectedZone === '4' ? '3.5' : '2.2'}
                />
                <text
                  x="241"
                  y="347"
                  fill={selectedZone === '4' ? '#FFFFFF' : '#231712'}
                  fontSize="13"
                  fontWeight="800"
                  textAnchor="middle"
                >
                  Pista 4.1
                </text>
                <text
                  x="241"
                  y="364"
                  fill={selectedZone === '4' ? '#F5F5DC' : '#6E5849'}
                  fontSize="9.5"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  Baloncesto (A·C·E)
                </text>
              </g>

              <g
                role="button"
                tabIndex={0}
                aria-label="Zona 4 Pista 4.2: Baloncesto 3x3"
                onClick={() => onSelectZone('4')}
                onKeyDown={(e) => e.key === 'Enter' && onSelectZone('4')}
                className="cursor-pointer"
              >
                <rect
                  x="512"
                  y="74"
                  width="98"
                  height="64"
                  rx="12"
                  fill={selectedZone === '4' ? '#E35336' : '#F4A460'}
                  stroke="#A0522D"
                  strokeWidth={selectedZone === '4' ? '3.5' : '2.2'}
                />
                <text
                  x="561"
                  y="100"
                  fill={selectedZone === '4' ? '#FFFFFF' : '#231712'}
                  fontSize="13"
                  fontWeight="800"
                  textAnchor="middle"
                >
                  Pista 4.2
                </text>
                <text
                  x="561"
                  y="118"
                  fill={selectedZone === '4' ? '#F5F5DC' : '#6E5849'}
                  fontSize="9.5"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  Baloncesto (B·D·Final)
                </text>
              </g>

              {/* ==================== ZONE 3: PÁDEL + NEW TURF PITCH (FÚTBOL 7 / BALONMANO) ==================== */}
              <g
                role="button"
                tabIndex={0}
                aria-label="Zona 3: Pistas de Pádel y Pista nueva de césped artificial para Fútbol 7 y Balonmano"
                onClick={() => onSelectZone('3')}
                onKeyDown={(e) => e.key === 'Enter' && onSelectZone('3')}
                className="cursor-pointer"
              >
                {/* Pádel main courts (center-right) */}
                <rect
                  x="430"
                  y="158"
                  width="92"
                  height="68"
                  rx="12"
                  fill={selectedZone === '3' ? '#E35336' : '#A0522D'}
                  stroke="#FFFFFF"
                  strokeWidth={selectedZone === '3' ? '3.5' : '2.2'}
                />
                <text x="476" y="185" fill="#FFFFFF" fontSize="14" fontWeight="800" textAnchor="middle">
                  3 · Pádel
                </text>
                <text x="476" y="202" fill="#F5F5DC" fontSize="9.5" fontWeight="700" textAnchor="middle">
                  Fem · Masc · Mixto
                </text>

                {/* Secondary Pádel court beside Zone 2 */}
                <rect
                  x="398"
                  y="328"
                  width="56"
                  height="40"
                  rx="9"
                  fill={selectedZone === '3' ? '#E35336' : '#A0522D'}
                  fillOpacity="0.88"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text x="426" y="352" fill="#FFFFFF" fontSize="10" fontWeight="800" textAnchor="middle">
                  3 · Pádel
                </text>

                {/* NEW TURF PITCH NEXT TO PÁDEL (Official Change!) */}
                <rect
                  x="530"
                  y="152"
                  width="148"
                  height="84"
                  rx="14"
                  fill="url(#turfGrad)"
                  stroke={selectedZone === '3' ? '#E35336' : '#FFFFFF'}
                  strokeWidth={selectedZone === '3' ? '4' : '2.5'}
                />
                {/* Pitch lines */}
                <rect
                  x="540"
                  y="162"
                  width="128"
                  height="64"
                  rx="6"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeOpacity="0.45"
                  strokeWidth="1.5"
                />
                <line
                  x1="604"
                  y1="162"
                  x2="604"
                  y2="226"
                  stroke="#FFFFFF"
                  strokeOpacity="0.45"
                  strokeWidth="1.5"
                />
                <circle
                  cx="604"
                  cy="194"
                  r="11"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeOpacity="0.45"
                  strokeWidth="1.5"
                />
                {/* Badge */}
                <rect x="556" y="140" width="96" height="20" rx="10" fill="#E35336" />
                <text x="604" y="154" fill="#FFFFFF" fontSize="9.5" fontWeight="800" textAnchor="middle">
                  PISTA NUEVA
                </text>
                <text x="604" y="191" fill="#FFFFFF" fontSize="11" fontWeight="800" textAnchor="middle">
                  Fútbol 7 · Balonmano
                </text>
                <text x="604" y="207" fill="#E6F5EC" fontSize="9" fontWeight="700" textAnchor="middle">
                  Césped artificial · junto a Pádel
                </text>
              </g>

              {/* ==================== OLD ZONE 1: RELOCATED MARKER ==================== */}
              <g
                role="button"
                tabIndex={0}
                aria-label="Antigua Zona 1: Trasladada junto a Pádel"
                onClick={() => onSelectZone('1')}
                onKeyDown={(e) => e.key === 'Enter' && onSelectZone('1')}
                className="cursor-pointer"
              >
                {/* Dashed arrow from old Zone 1 up to New Pitch */}
                <path
                  d="M555,274 C570,256 582,250 594,238"
                  fill="none"
                  stroke="#B91C1C"
                  strokeWidth="2.5"
                  strokeDasharray="5 4"
                />
                <polygon points="598,234 587,236 594,244" fill="#B91C1C" />

                <rect
                  x="485"
                  y="274"
                  width="126"
                  height="52"
                  rx="12"
                  fill={selectedZone === '1' ? '#FEF2F2' : '#FFFFFF'}
                  fillOpacity="0.92"
                  stroke="#B91C1C"
                  strokeWidth={selectedZone === '1' ? '3' : '2'}
                  strokeDasharray="6 4"
                />
                <text x="548" y="295" fill="#B91C1C" fontSize="11.5" fontWeight="800" textAnchor="middle">
                  1 · Antigua pista
                </text>
                <text x="548" y="312" fill="#7F1D1D" fontSize="9.5" fontWeight="700" textAnchor="middle">
                  Trasladada junto a Pádel
                </text>
              </g>

              {/* Compass & Legend Pill */}
              <g transform="translate(24, 468)">
                <rect
                  x="0"
                  y="0"
                  width="342"
                  height="52"
                  rx="14"
                  fill="#FFFFFF"
                  fillOpacity="0.95"
                  stroke="#E6DEC3"
                  strokeWidth="1.5"
                />
                <circle cx="26" cy="26" r="14" fill="#A0522D" />
                <text x="26" y="30" fill="#FFFFFF" fontSize="11" fontWeight="800" textAnchor="middle">
                  N
                </text>
                <text x="52" y="22" fill="#231712" fontSize="11" fontWeight="800">
                  CDSCM Melilla · La Hípica
                </text>
                <text x="52" y="38" fill="#6E5849" fontSize="9.5" fontWeight="600">
                  Verde: Pista nueva F7/Balonmano · Naranja: Pistas 4.1 y 4.2
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Selected Zone Highlight Banner */}
        <div className="border-t border-[#E6DEC3] bg-[#F5F5DC]/65 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-extrabold tabular-nums shrink-0 mt-0.5 ${
                activeZone.id === '1'
                  ? 'bg-[#FEF2F2] text-[#B91C1C] border border-[#B91C1C]/40'
                  : 'bg-[#E35336] text-white'
              }`}
            >
              {activeZone.id}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-extrabold text-[#231712] leading-snug">
                  {activeZone.name}
                </h3>
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-[#E6DEC3] px-2.5 py-1 text-[11px] font-bold text-[#6E5849] tabular-nums shrink-0">
                  <Clock className="w-3.5 h-3.5 text-[#A0522D]" aria-hidden="true" />
                  <span>{activeZone.scheduleSummary}</span>
                </div>
              </div>

              {activeZone.statusTag && (
                <div className="mt-1.5">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                      activeZone.id === '1'
                        ? 'bg-[#FEF2F2] text-[#B91C1C] border border-[#B91C1C]/30'
                        : 'bg-[#F4A460]/30 text-[#A0522D]'
                    }`}
                  >
                    {activeZone.statusTag}
                  </span>
                </div>
              )}

              <p className="mt-2 text-xs sm:text-sm text-[#231712] leading-relaxed">
                {activeZone.description}
              </p>

              {activeZone.subCourts && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {activeZone.subCourts.map((sub) => (
                    <span
                      key={sub}
                      className="inline-flex items-center gap-1 rounded-lg bg-white border border-[#E6DEC3] px-2.5 py-1 text-xs font-bold text-[#A0522D]"
                    >
                      <MapPin className="w-3 h-3 text-[#E35336]" aria-hidden="true" />
                      {sub}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {activeZone.sportIds.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-2">
              {activeZone.sportIds.map((sportId) => (
                <button
                  key={sportId}
                  type="button"
                  onClick={() => onJumpToSport(sportId)}
                  className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-[#E35336] hover:bg-[#c9452a] text-white px-3.5 py-2 text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <SportIcon sportId={sportId} className="w-3.5 h-3.5" />
                  <span>Ir a {SPORTS_BY_ID[sportId].name}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Interactive List of all 7 Zones */}
      <section aria-label="Listado de las 7 zonas del recinto" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-extrabold text-[#A0522D]">
            Todas las zonas del recinto (7)
          </h3>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#6E5849]">
            <Info className="w-3.5 h-3.5" aria-hidden="true" />
            Toca una zona para ubicarla
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ZONES.map((zone) => {
            const isSelected = zone.id === selectedZone;
            return (
              <div
                key={zone.id}
                className={`rounded-2xl border p-4 transition-all shadow-earth ${
                  isSelected
                    ? 'bg-[#F4A460]/15 border-[#E35336] ring-1 ring-[#E35336]/20'
                    : 'bg-white border-[#E6DEC3] hover:border-[#F4A460]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectZone(zone.id)}
                  className="w-full text-left cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-extrabold tabular-nums shrink-0 ${
                          zone.id === '1'
                            ? 'bg-[#FEF2F2] text-[#B91C1C] border border-[#B91C1C]/35'
                            : isSelected
                              ? 'bg-[#E35336] text-white'
                              : 'bg-[#A0522D] text-white'
                        }`}
                      >
                        {zone.id}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-[#231712] leading-snug">
                          {zone.shortLabel}
                        </h4>
                        <p className="text-[11px] font-semibold text-[#6E5849] tabular-nums">
                          {zone.scheduleSummary}
                        </p>
                      </div>
                    </div>

                    {zone.statusTag && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold whitespace-nowrap shrink-0 ${
                          zone.id === '1'
                            ? 'bg-[#FEF2F2] text-[#B91C1C]'
                            : 'bg-[#F4A460]/25 text-[#A0522D]'
                        }`}
                      >
                        {zone.statusTag}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-[#6E5849] leading-relaxed">
                    {zone.description}
                  </p>
                </button>

                {zone.sportIds.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#E6DEC3]/70 flex flex-wrap gap-1.5">
                    {zone.sportIds.map((sportId) => (
                      <button
                        key={sportId}
                        type="button"
                        onClick={() => onJumpToSport(sportId)}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#F5F5DC] hover:bg-[#E35336] hover:text-white border border-[#E6DEC3] px-2.5 py-1 text-[11px] font-bold text-[#A0522D] transition-colors cursor-pointer"
                      >
                        <SportIcon sportId={sportId} className="w-3 h-3" />
                        <span>{SPORTS_BY_ID[sportId].shortName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
