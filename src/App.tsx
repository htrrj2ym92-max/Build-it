import { useEffect, useState } from 'react'
import { BUILDINGS, BUILDING_ORDER, LEVELS } from './game/data'
import BuildingArt from './game/BuildingArt'
import { build, builders, busyBuilders, canAfford, demolish, gather, goalProgress, income, newGame, nextLevel, tick } from './game/logic'
import { clearSave, loadGame, saveGame } from './game/storage'
import type { BuildingType, GameState } from './game/types'

type Tool = 'build' | 'demolish'

export default function App() {
  const [game, setGame] = useState<GameState>(loadGame)
  const [tool, setTool] = useState<Tool>('build')
  const [selectedLot, setSelectedLot] = useState<number | null>(null)

  useEffect(() => {
    const id = setInterval(() => setGame(tick), 1000)
    return () => clearInterval(id)
  }, [])
  useEffect(() => saveGame(game), [game])

  const size = Math.sqrt(game.grid.length)
  const inc = income(game)
  const goals = goalProgress(game)
  const free = builders(game) - busyBuilders(game)

  const onCell = (i: number) => {
    if (tool === 'demolish') {
      setGame((g) => demolish(g, i))
    } else if (!game.grid[i]?.type) {
      setSelectedLot(i)
    }
  }

  const constructAt = (type: BuildingType) => {
    if (selectedLot === null) return
    setGame((g) => build(g, selectedLot, type))
    setTool('build')
    setSelectedLot(null)
  }

  const costLabel = (type: BuildingType) =>
    Object.entries(BUILDINGS[type].cost)
      .map(([k, v]) => `${v}${k === 'wood' ? '🪵' : k === 'stone' ? '🪨' : '💰'}`)
      .join(' ')

  const reset = () => {
    if (window.confirm('Start over? All progress will be lost.')) {
      clearSave()
      setGame(newGame())
    }
  }

  return (
    <div className="app">
      <header>
        <h1>🏗️ Build It</h1>
        <span>Level {game.level + 1}{game.level >= LEVELS.length ? ' (bonus)' : ''}</span>
        <button onClick={reset}>Restart</button>
      </header>

      <div className="stats">
        <span>🪵 {Math.floor(game.resources.wood)} <small>+{inc.wood}/s</small></span>
        <span>🪨 {Math.floor(game.resources.stone)} <small>+{inc.stone}/s</small></span>
        <span>💰 {Math.floor(game.resources.gold)} <small>+{inc.gold}/s</small></span>
        <span>👷 {free}/{builders(game)}</span>
      </div>

      <main>
        <section className="board" aria-label="Neighborhood building lots" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
          {game.grid.map((c, i) => (
            <button
              key={i}
              className={'cell' + (c.type ? (c.remaining ? ' building' : ' built') : '')}
              onClick={() => onCell(i)}
              aria-label={c.type ? `${BUILDINGS[c.type].name}${c.remaining ? `, construction in progress, ${c.remaining} seconds left` : ''}` : 'Empty plot'}
            >
              {c.type && (
                <BuildingArt
                  type={c.type}
                  progress={c.remaining > 0 ? (BUILDINGS[c.type].buildTime - c.remaining) / BUILDINGS[c.type].buildTime : 1}
                />
              )}
              {c.type && c.remaining > 0 && (
                <span className="timer">
                  {(BUILDINGS[c.type].buildTime - c.remaining) / BUILDINGS[c.type].buildTime < 0.25
                    ? 'Foundation'
                    : (BUILDINGS[c.type].buildTime - c.remaining) / BUILDINGS[c.type].buildTime < 0.55
                      ? 'Building'
                      : 'Nearly complete'} · {c.remaining}s
                </span>
              )}
            </button>
          ))}
        </section>

        <aside>
          <div className="panel">
            <h2>Goal</h2>
            <ul>
              {goals.map((g) => (
                <li key={g.label} className={g.have >= g.need ? 'done' : ''}>
                  {g.label}: {g.have}/{g.need}
                </li>
              ))}
            </ul>
          </div>
          <div className="panel">
            <h2>Build</h2>
            <div className="tools">
              {BUILDING_ORDER.map((t) => {
                const def = BUILDINGS[t]
                return (
                  <div key={t} className={'tool' + (canAfford(game.resources, t) ? '' : ' poor')} title={def.desc}>
                    <b>{def.icon} {def.name}</b>
                    <small>{costLabel(t)} · {def.buildTime}s</small>
                    <small>{def.desc}</small>
                  </div>
                )
              })}
              <button className={'tool' + (tool === 'demolish' ? ' active' : '')} onClick={() => setTool('demolish')}>
                <b>💥 Demolish</b>
                <small>Refunds 50% of cost</small>
              </button>
            </div>
            <button className="gather" onClick={() => setGame(gather)}>🪵 Chop wood (+5)</button>
          </div>
        </aside>
      </main>

      {game.won && (
        <div className="overlay">
          <div className="modal">
            <h2>🎉 Level {game.level + 1} complete!</h2>
            <p>{game.level + 1 >= LEVELS.length ? 'You have mastered the town. Keep going in bonus levels!' : 'The town grows bigger.'}</p>
            <button onClick={() => setGame(nextLevel)}>Next level</button>
          </div>
        </div>
      )}

      {selectedLot !== null && (
        <div className="overlay" onClick={() => setSelectedLot(null)}>
          <div className="modal build-modal" role="dialog" aria-modal="true" aria-labelledby="build-title" onClick={(event) => event.stopPropagation()}>
            <h2 id="build-title">Choose a building</h2>
            <p>Lot {selectedLot + 1} · {free > 0 ? `${free} builder${free === 1 ? '' : 's'} available` : 'No builders available'}</p>
            <div className="build-options">
              {BUILDING_ORDER.map((type) => {
                const def = BUILDINGS[type]
                const affordable = canAfford(game.resources, type)
                return (
                  <button key={type} className={'tool' + (affordable && free > 0 ? '' : ' poor')} disabled={!affordable || free <= 0} onClick={() => constructAt(type)}>
                    <b>{def.icon} {def.name}</b>
                    <small>{costLabel(type)} · {def.buildTime}s</small>
                    <small>{def.desc}</small>
                  </button>
                )
              })}
            </div>
            <button className="cancel-build" onClick={() => setSelectedLot(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
