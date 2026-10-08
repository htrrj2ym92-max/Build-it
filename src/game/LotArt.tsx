const CORNERS: [number, number][] = [[14, 30], [86, 30], [8, 78], [92, 78]]

export default function LotArt({ owned, built }: { owned: boolean; built: boolean }) {
  const post = owned ? '#f1a53e' : '#d95d4c'
  return (
    <svg className="lot-art" viewBox="0 0 100 100" aria-hidden="true" preserveAspectRatio="none">
      <path fill={owned ? '#8fcb5f' : '#a2b48b'} stroke="#e7f2bd" strokeWidth="2" strokeLinejoin="round" d="M14 30 86 30 92 78 8 78Z" />
      <path fill="none" stroke={owned ? '#f6f4d8' : '#fff'} strokeWidth="1.6" strokeDasharray="4 3" strokeLinejoin="round" d="M20 36 80 36 85 72 15 72Z" />
      {CORNERS.map(([x, y]) => (
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
    </svg>
  )
}
