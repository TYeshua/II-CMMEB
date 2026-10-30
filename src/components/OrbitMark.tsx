// Sinal da estrutura do site: a indústria no centro, a margem na primeira órbita e o ambiente na segunda.
// Desenhado em pontos, como as cenas 3D. O anel da seção atual aparece em laranja.
export type Ring = 'centro' | 'margem' | 'ambiente'

const dots = (r: number, n: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    return [50 + Math.cos(a) * r, 50 + Math.sin(a) * r] as const
  })

export function OrbitMark({ active, className = '' }: { active: Ring; className?: string }) {
  const on = '#f5a524'
  const off = 'currentColor'
  return (
    <svg viewBox="0 0 100 100" className={`shrink-0 ${className}`} role="img" aria-label={
      active === 'centro' ? 'No centro: a indústria' : active === 'margem' ? 'Primeira órbita: a margem' : 'Segunda órbita: o ambiente'
    }>
      {dots(44, 44).map(([x, y], i) => (
        <circle key={`o${i}`} cx={x} cy={y} r={active === 'ambiente' ? 2.6 : 1.8} fill={active === 'ambiente' ? on : off} opacity={active === 'ambiente' ? 1 : 0.45} />
      ))}
      {dots(27, 28).map(([x, y], i) => (
        <circle key={`i${i}`} cx={x} cy={y} r={active === 'margem' ? 2.6 : 1.8} fill={active === 'margem' ? on : off} opacity={active === 'margem' ? 1 : 0.45} />
      ))}
      <circle cx="50" cy="50" r={active === 'centro' ? 11 : 8} fill={active === 'centro' ? on : off} opacity={active === 'centro' ? 1 : 0.45} />
    </svg>
  )
}
