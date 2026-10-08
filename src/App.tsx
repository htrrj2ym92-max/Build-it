import { useEffect, useState } from 'react'
import { BUILDINGS, BUILDING_ORDER, LEVELS } from './game/data'
import BuildingArt from './game/BuildingArt'
import { build, builders, busyBuilders, canAfford, demolish, gather, goalProgress, income, newGame, nextLevel, tick } from './game/logic'
import { clearSave, loadGame, saveGame } from './game/storage'
import type { BuildingType, GameState } from './game/types'

type Tool = BuildingType | 'demolish'

export default function App() {
  const [game, setGame] = useState<GameState>(loadGame)
  const [tool, setTool] = useState<Tool>('house')

  useEffect(() => {
    const id = setInterval(() => setGame(tick), 1000)
    return () => clearInterval(id)
  }, [])
  useEffect(() => saveGame(game), [game])

  const size = Math.sqrt(game.grid.length)
  const inc = income(game)
  const goals = goalProgress(game)
  const free = builders(game) - busyBuilders(game)

  const onCell = (i: number) =>
    setGame((g) => (tool === 'demolish' ? demolish(g, i) : build(g, i, tool)))

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
              {c.type && <BuildingArt type={c.type} />}
              {c.type && c.remaining > 0 && <span className="timer">{c.remaining}s</span>}
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
                const cost = Object.entries(def.cost).map(([k, v]) => `${v}${k === 'wood' ? '🪵' : k === 'stone' ? '🪨' : '💰'}`).join(' ')
                return (
                  <button key={t} className={'tool' + (tool === t ? ' active' : '') + (canAfford(game.resources, t) ? '' : ' poor')} onClick={() => setTool(t)} title={def.desc}>
                    <b>{def.icon} {def.name}</b>
                    <small>{cost} · {def.buildTime}s</small>
                    <small>{def.desc}</small>
                  </button>
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
    </div>
  )
}
