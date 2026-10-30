// Perfil esquemático da costa à bacia (sem escala, vertical exagerada).
// Um único desenho de 4000 × 1000; cada folha do transecto mostra um recorte.
const SURF = 300

const BED: [number, number][] = [
  [0, 286], [250, 290], [500, 297], [560, 302], [650, 308], [760, 320], [900, 340], [1300, 372], [1700, 398],
  [2100, 424], [2250, 440], [2350, 500], [2420, 562], [2460, 650], [2500, 602], [2580, 700], [2650, 760],
  [2690, 842], [2735, 796], [2850, 880], [2950, 905], [3200, 915], [3500, 924], [3800, 930], [4000, 934],
]
const bedAt = (x: number) => {
  for (let i = 1; i < BED.length; i++) if (x <= BED[i][0]) {
    const [x0, y0] = BED[i - 1], [x1, y1] = BED[i]
    return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
  }
  return 934
}

const bedPath = 'M0,1000 ' + BED.map(([x, y]) => `L${x},${y}`).join(' ') + ' L4000,1000 Z'
let wave = `M540,${SURF}`
for (let x = 540; x < 4000; x += 40) wave += ` Q${x + 10},${SURF - 7} ${x + 20},${SURF} T${x + 40},${SURF}`
const waterPath = wave + ' L4000,1000 L540,1000 Z'

function Mangrove({ x, s = 1 }: { x: number; s?: number }) {
  const g = bedAt(x)
  return (
    <g className="sway" style={{ animationDelay: `${-x / 90}s` }}>
      <g fill="none" stroke="var(--ink-a)" strokeWidth={7 * s} strokeLinecap="round">
        <path d={`M${x},${g - 48 * s} V${g - 120 * s}`} />
        <path d={`M${x},${g - 50 * s} C${x - 22 * s},${g - 44 * s} ${x - 40 * s},${g - 26 * s} ${x - 46 * s},${g + 2}`} />
        <path d={`M${x},${g - 50 * s} C${x + 20 * s},${g - 44 * s} ${x + 38 * s},${g - 28 * s} ${x + 44 * s},${g + 2}`} />
        <path d={`M${x},${g - 66 * s} C${x - 8 * s},${g - 50 * s} ${x - 18 * s},${g - 20 * s} ${x - 18 * s},${g + 2}`} />
        <path d={`M${x},${g - 66 * s} C${x + 8 * s},${g - 50 * s} ${x + 16 * s},${g - 22 * s} ${x + 18 * s},${g + 2}`} />
      </g>
      <g fill="var(--ink-a)">
        <circle cx={x - 34 * s} cy={g - 128 * s} r={40 * s} />
        <circle cx={x + 30 * s} cy={g - 132 * s} r={44 * s} />
        <circle cx={x} cy={g - 166 * s} r={50 * s} />
      </g>
    </g>
  )
}

function Ibis({ x, y, s = 1, d = 0 }: { x: number; y: number; s?: number; d?: number }) {
  return (
    <g className="drift" style={{ animationDelay: `${d}s` }}>
      <g transform={`translate(${x},${y}) scale(${s})`}>
        <path d="M-34,0 C-14,-26 4,-24 10,-4 C20,-26 42,-30 56,-6 C40,-12 24,-6 14,6 C4,10 -10,10 -34,0Z" fill="#d33a2c" />
        <path d="M-34,0 C-46,4 -58,14 -66,26" stroke="#d33a2c" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M44,-14 L56,-6 L48,-2Z" fill="#160a0a" />
      </g>
    </g>
  )
}

function Turbine({ x, d }: { x: number; d: number }) {
  const g = bedAt(x)
  return (
    <g>
      <path d={`M${x - 9},${SURF} L${x - 9},${g} L${x + 9},${g} L${x + 9},${SURF}Z`} fill="var(--ink-u)" />
      <rect x={x - 14} y={SURF - 22} width="28" height="30" fill="#f5a524" />
      <path d={`M${x - 10},${SURF - 22} L${x - 5},${SURF - 250} L${x + 5},${SURF - 250} L${x + 10},${SURF - 22}Z`} fill="var(--ink-a)" />
      <rect x={x - 12} y={SURF - 262} width="40" height="18" rx="4" fill="var(--ink-a)" />
      <g className="spin" style={{ animationDelay: `${-d}s` }}>
        <g transform={`translate(${x - 2},${SURF - 253})`} fill="var(--ink-a)">
          <path d="M-4,0 L-2,-150 L4,-150 L4,0Z" />
          <path d="M-4,0 L-2,-150 L4,-150 L4,0Z" transform="rotate(120)" />
          <path d="M-4,0 L-2,-150 L4,-150 L4,0Z" transform="rotate(240)" />
          <circle r="9" />
        </g>
      </g>
    </g>
  )
}

function Reef() {
  const corals: [number, string, number][] = [[1880, '#d33a2c', 1], [1925, '#f5a524', 0.8], [1975, '#e0622a', 1.2], [2030, '#ff8a76', 0.9], [2085, '#f5a524', 1.1], [2130, '#d33a2c', 0.7]]
  return (
    <g>
      {corals.map(([x, c, s], i) => {
        const g = bedAt(x)
        return (
          <g key={x} fill="none" stroke={c} strokeWidth={9 * s} strokeLinecap="round">
            <path d={`M${x},${g} C${x},${g - 30 * s} ${x - 20 * s},${g - 40 * s} ${x - 24 * s},${g - 70 * s}`} />
            <path d={`M${x},${g - 20 * s} C${x + 10 * s},${g - 40 * s} ${x + 26 * s},${g - 44 * s} ${x + 28 * s},${g - 66 * s}`} />
            {i % 2 === 0 && <path d={`M${x},${g - 30 * s} V${g - 84 * s}`} />}
            <ellipse cx={x} cy={g + 2} rx={36 * s} ry={10 * s} fill={c} stroke="none" />
          </g>
        )
      })}
      <g className="drift" style={{ animationDuration: '9s' }} fill="var(--ink-u)">
        {[[1950, 360], [1985, 372], [2010, 352], [2045, 366], [1965, 384]].map(([x, y]) => (
          <path key={x + '-' + y} d={`M${x},${y} q12,-8 24,0 q-12,8 -24,0Z M${x + 24},${y} l9,-6 v12Z`} />
        ))}
      </g>
    </g>
  )
}

function Platform() {
  const x = 3520
  return (
    <g>
      {/* ancoragem e riser */}
      <g fill="none" stroke="var(--ink-u)" strokeWidth="3" opacity="0.7">
        <path d={`M${x - 70},350 C${x - 140},560 ${x - 260},860 ${x - 330},${bedAt(x - 330)}`} />
        <path d={`M${x + 70},350 C${x + 140},560 ${x + 260},860 ${x + 330},${bedAt(x + 330)}`} />
      </g>
      <path d={`M${x},360 V${bedAt(x) - 26}`} stroke="var(--ink-u)" strokeWidth="6" />
      <rect x={x - 18} y={bedAt(x) - 40} width="36" height="40" fill="#f5a524" />
      {/* casco */}
      <rect x={x - 110} y={330} width="220" height="34" rx="10" fill="var(--ink-u)" />
      <g fill="var(--ink-a)">
        <rect x={x - 96} y={226} width="36" height="110" />
        <rect x={x + 60} y={226} width="36" height="110" />
        <rect x={x - 124} y={204} width="248" height="28" />
        <rect x={x - 112} y={170} width="80" height="36" />
        <rect x={x + 40} y={180} width="62" height="26" fill="#e0622a" />
        <path d={`M${x - 126},166 h70 v-8 h-70Z`} />
      </g>
      <rect x={x - 96} y={282} width="36" height="16" fill="#e0622a" />
      <rect x={x + 60} y={282} width="36" height="16" fill="#e0622a" />
      {/* torre */}
      <g fill="none" stroke="var(--ink-a)" strokeWidth="5">
        <path d={`M${x - 24},204 L${x - 6},60 L${x + 6},60 L${x + 24},204`} />
        <path d={`M${x - 20},180 L${x + 16},140 L${x - 14},104 L${x + 10},74 M${x + 20},180 L${x - 16},140 L${x + 14},104 L${x - 10},74`} />
      </g>
      {/* flare */}
      <path d={`M${x + 120},216 L${x + 250},120`} stroke="var(--ink-a)" strokeWidth="7" />
      <g className="flick">
        <path d={`M${x + 250},120 C${x + 230},96 ${x + 246},70 ${x + 262},48 C${x + 266},72 ${x + 286},90 ${x + 268},120Z`} fill="#f5a524" />
        <path d={`M${x + 254},120 C${x + 246},104 ${x + 254},90 ${x + 262},78 C${x + 266},94 ${x + 274},104 ${x + 264},120Z`} fill="#ffe2a8" />
      </g>
      {/* ROV */}
      <path d={`M${x},420 C${x + 60},560 ${x + 220},700 ${x + 180},${bedAt(x + 180) - 70}`} fill="none" stroke="#f5a524" strokeWidth="3" strokeDasharray="10 8" />
      <g className="bob">
        <rect x={x + 150} y={bedAt(x + 180) - 92} width="64" height="40" rx="6" fill="#f5a524" />
        <rect x={x + 156} y={bedAt(x + 180) - 56} width="52" height="10" fill="var(--ink-u)" />
        <circle cx={x + 210} cy={bedAt(x + 180) - 80} r="6" fill="#ffe2a8" />
      </g>
    </g>
  )
}

export type Crop = [number, number, number, number]

export function ProfileArt({ crop, className = '' }: { crop: Crop; className?: string }) {
  const [x0, x1, y0, y1] = crop
  return (
    <svg
      viewBox={`${x0} ${y0} ${x1 - x0} ${y1 - y0}`}
      preserveAspectRatio="xMidYMax meet"
      className={`profile-art ${className}`}
      aria-hidden="true"
    >
      <path d={waterPath} fill="var(--water)" />
      {/* Corrente Norte do Brasil */}
      <g fill="none" stroke="var(--ink-u)" strokeWidth="5" strokeLinecap="round" opacity="0.85">
        {[350, 395, 440].map((y, i) => (
          <g key={y}>
            <path className="flow" style={{ animationDelay: `${-i * 0.6}s` }} d={`M${2240 + i * 40},${y} C${2500},${y - 20} ${2750},${y + 18} ${3060 - i * 30},${y}`} />
            <path d={`M${3040 - i * 30},${y - 14} L${3062 - i * 30},${y} L${3040 - i * 30},${y + 14}`} />
          </g>
        ))}
      </g>
      <path d={bedPath} fill="var(--bed)" />

      {[70, 150, 235, 320, 405, 480].map((x, i) => <Mangrove key={x} x={x} s={i % 2 ? 0.86 : 1} />)}
      <Ibis x={190} y={70} s={1.1} />
      <Ibis x={330} y={44} s={0.9} d={-2} />
      <Ibis x={470} y={92} s={1} d={-4} />
      <Ibis x={620} y={58} s={0.8} d={-1} />

      {/* curral de pesca */}
      <g stroke="var(--ink-a)" strokeWidth="6" strokeLinecap="round">
        {[640, 668, 696, 724, 752, 780, 808, 836].map((x, i) => (
          <path key={x} d={`M${x},${SURF - 34 + (i % 3) * 6} V${bedAt(x)}`} />
        ))}
        <path d={`M640,${SURF - 14} H836`} strokeWidth="3" />
      </g>
      {/* biana de vela colorida */}
      <g className="bob">
        <path d={`M900,${SURF - 4} h120 l-18,22 h-86Z`} fill="var(--ink-a)" />
        <path d={`M958,${SURF - 6} V${SURF - 150}`} stroke="var(--ink-a)" strokeWidth="5" />
        <path d={`M962,${SURF - 146} C1010,${SURF - 110} 1030,${SURF - 60} 1018,${SURF - 14} H962Z`} fill="#e0622a" />
      </g>

      {[1270, 1530, 1790].map((x, i) => <Turbine key={x} x={x} d={i * 2.3} />)}
      <Reef />

      {/* observatório de fundo */}
      <g>
        <path d={`M3150,${SURF + 6} V${bedAt(3150) - 60}`} stroke="var(--ink-u)" strokeWidth="3" strokeDasharray="8 8" />
        <g className="bob"><rect x="3134" y={SURF - 22} width="32" height="30" rx="6" fill="#f5a524" /></g>
        <path d={`M3150,${bedAt(3150) - 60} L3120,${bedAt(3120)} M3150,${bedAt(3150) - 60} L3180,${bedAt(3180)}`} stroke="var(--ink-u)" strokeWidth="5" />
        <circle cx="3150" cy={bedAt(3150) - 66} r="14" fill="var(--ink-u)" />
      </g>

      <Platform />
    </svg>
  )
}
