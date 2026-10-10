const CORNERS: [number, number][] = [[14, 30], [86, 30], [8, 78], [92, 78]]

const CONSTRUCTION_GROUNDS = ['#a77a4f', '#b4a078', '#a29a78', '#9fc273']

export default function LotArt({ owned, built, phase, landscaped = false }: { owned: boolean; built: boolean; phase?: number; landscaped?: boolean }) {
  const post = owned ? '#f1a53e' : '#d95d4c'
  const constructing = phase !== undefined
  const ground = constructing ? CONSTRUCTION_GROUNDS[phase - 1] : built ? '#8fcb5f' : owned ? '#8fcb5f' : '#a2b48b'
  return (
    <svg className="lot-art" viewBox="0 0 100 100" aria-hidden="true" preserveAspectRatio="none">
      <path fill={ground} stroke="#e7f2bd" strokeWidth="2" strokeLinejoin="round" d="M14 30 86 30 92 78 8 78Z" />
      {!built && <path fill="none" stroke={owned ? '#f6f4d8' : '#fff'} strokeWidth="1.6" strokeDasharray="4 3" strokeLinejoin="round" d="M20 36 80 36 85 72 15 72Z" />}
      {constructing && phase === 1 && (
        <g fill="#795a3d" opacity=".55">
          <path d="m25 43 12-3 8 3-12 3Zm32 17 15-4 8 3-14 4Zm-24 5 9-2 5 2-9 3Z" />
        </g>
      )}
      {constructing && phase === 2 && (
        <g fill="#e5d6b5" opacity=".8">
          <circle cx="30" cy="47" r="1.5" /><circle cx="42" cy="57" r="1" /><circle cx="72" cy="43" r="1.4" />
          <circle cx="58" cy="68" r="1.3" /><circle cx="79" cy="62" r="1" /><circle cx="25" cy="66" r="1" />
        </g>
      )}
      {constructing && phase === 3 && (
        <g fill="none" stroke="#776747" strokeWidth="1.2" opacity=".65">
          <path d="m22 44 12 4m35 15 13-4M37 68l9-3" />
        </g>
      )}
      {constructing && phase === 4 && (
        <g fill="none" stroke="#6e984d" strokeWidth="1" opacity=".7">
          <path d="m24 43 2-3m5 4 2-3m38 23 2-3m5 4 2-3M42 67l2-3" />
        </g>
      )}
      {!built && CORNERS.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <ellipse cx={x} cy={y + 1} rx="4" ry="1.6" fill="#2a432840" />
          <path fill={post} stroke="#8d5736" strokeWidth="1" strokeLinejoin="round" d={`M${x - 3} ${y + 1}L${x} ${y - 9}L${x + 3} ${y + 1}Z`} />
          <path fill="#fff" d={`M${x - 1.7} ${y - 3}h3.4l.8 2.2h-5Z`} />
        </g>
      ))}
      {!built && (
        <g>
          <path fill="#fff" stroke="#8d5736" strokeWidth="1" d="M50 38v-9" />
          <path fill={owned ? '#4fa860' : '#d95d4c'} stroke="#8d5736" strokeWidth="1" strokeLinejoin="round" d="M50 29 61 33 50 37Z" />
        </g>
      )}
      {built && !constructing && landscaped && (
        <g>
          <g fill="#477d3a" stroke="#3b672f" strokeWidth=".8">
            <circle cx="18" cy="65" r="3" /><circle cx="23" cy="68" r="2.5" />
            <circle cx="79" cy="41" r="3" /><circle cx="83" cy="44" r="2.5" />
          </g>
          <g fill="#f5db6e">
            <circle cx="20" cy="64" r=".8" /><circle cx="81" cy="40" r=".8" />
          </g>
        </g>
      )}
    </svg>
  )
}
