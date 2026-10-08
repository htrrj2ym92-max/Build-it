import { useEffect, useState } from 'react'
import { BUILDINGS, BUILDING_ORDER, EFFICIENCY_TRAINING_COST, LEVELS, MATERIAL_DELIVERY_TIME, MATERIAL_ORDER_AMOUNT, MATERIAL_ORDER_COST, MAX_UPGRADE, TICKS_PER_DAY, WORKER_HIRE_COSTS } from './game/data'
import BuildingArt from './game/BuildingArt'
import { build, builders, busyBuilders, canBuild, demolish, gather, goalProgress, hasWorkshop, hireWorkers, income, inspect, isOwned, maintain, maintainCost, newGame, nextLevel, orderMaterials, rentalIncome, salePrice, sell, tick, trainEfficiency, upgrade, upgradeCost, workerHireCost } from './game/logic'
import { clearSave, loadGame, saveGame } from './game/storage'
import type { BuildingType, GameState } from './game/types'

type Tool = 'build' | 'demolish'

export default function App() {
  const [game, setGame] = useState<GameState>(loadGame)
  const [tool, setTool] = useState<Tool>('build')
  const [selectedLot, setSelectedLot] = useState<number | null>(null)
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      if (!paused) setGame(tick)
    }, 1000)
    return () => clearInterval(id)
  }, [paused])
  useEffect(() => saveGame(game), [game])

  const size = Math.sqrt(game.grid.length)
  const inc = income(game)
  const rent = rentalIncome(game)
  const goals = goalProgress(game)
  const free = builders(game) - busyBuilders(game)
  const workshopBuilt = hasWorkshop(game)
  const gameDay = Math.floor(game.ticks / TICKS_PER_DAY) + 1
  const gameHour = Math.floor((game.ticks % TICKS_PER_DAY) * 24 / TICKS_PER_DAY)

  const onCell = (i: number) => {
    if (tool === 'demolish') {
      setGame((g) => demolish(g, i))
    } else if (!game.grid[i]?.type) {
      setSelectedLot(i)
    } else if (game.grid[i].remaining === 0) {
      setSelectedBuilding(i)
    }
  }

  const constructAt = (type: BuildingType) => {
    if (selectedLot === null) return
    setGame((g) => build(g, selectedLot, type))
    setTool('build')
    setSelectedLot(null)
  }

  const act = (fn: (g: GameState, i: number) => GameState, close = false) => {
    if (selectedBuilding === null) return
    setGame((g) => fn(g, selectedBuilding))
    if (close) setSelectedBuilding(null)
  }

  const sel = selectedBuilding !== null ? game.grid[selectedBuilding] : null

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
        <span className="money">💵 ${Math.floor(game.money).toLocaleString()}</span>
        <span className="rent">🏠 ${rent.toLocaleString()}/day rent</span>
        <span>🕒 Day {gameDay}, {String(gameHour).padStart(2, '0')}:00</span>
        <button className="pause" onClick={() => setPaused((value) => !value)} aria-pressed={paused}>
          {paused ? '▶ Resume' : '⏸ Pause'}
        </button>
        <span>🪵 {Math.floor(game.resources.wood)} <small>+{inc.wood}/s</small></span>
        <span>🪨 {Math.floor(game.resources.stone)} <small>+{inc.stone}/s</small></span>
        <span>💰 {Math.floor(game.resources.gold)} <small>+{inc.gold}/s</small></span>
        <span>👷 {free}/{builders(game)}</span>
      </div>

      <main>
        <div className="board-wrap">
        <section className="board" aria-label="Neighborhood building lots" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
          {game.grid.map((c, i) => (
            <button
              key={i}
              className={'cell' + (c.type ? (c.remaining ? ' building' : c.sold ? ' built sold' : ' built') : '')}
              onClick={() => onCell(i)}
              aria-label={c.type ? `${BUILDINGS[c.type].name}${c.remaining ? `, construction in progress, ${c.remaining} seconds left` : c.sold ? `, level ${c.level + 1}, sold` : `, level ${c.level + 1}`}` : 'Empty plot'}
            >
              {c.type && (
                <BuildingArt
                  type={c.type}
                  level={c.level}
                  progress={c.remaining > 0 ? (BUILDINGS[c.type].buildTime - c.remaining) / BUILDINGS[c.type].buildTime : 1}
                />
              )}
              {c.sold && <span className="timer sold-tag">Sold</span>}
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
        <div className="dock" role="toolbar" aria-label="Quick actions">
          <button className="dock-btn wood" onClick={() => setGame(gather)}><span>🪵</span>Chop wood</button>
          <button className={'dock-btn danger' + (tool === 'demolish' ? ' active' : '')} onClick={() => setTool((t) => (t === 'demolish' ? 'build' : 'demolish'))} aria-pressed={tool === 'demolish'}><span>💥</span>{tool === 'demolish' ? 'Tap building' : 'Demolish'}</button>
          <button className="dock-btn" onClick={() => setPaused((value) => !value)} aria-pressed={paused}><span>{paused ? '▶' : '⏸'}</span>{paused ? 'Resume' : 'Pause'}</button>
        </div>
        </div>

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
          <div className="panel materials-panel">
            <h2>Construction materials</h2>
            <div className="material-inventory">
              <span>🪵 Wood <b>{Math.floor(game.resources.wood)}</b></span>
              <span>🪨 Stone <b>{Math.floor(game.resources.stone)}</b></span>
            </div>
            <div className="tools">
              {(['wood', 'stone'] as const).map((material) => (
                <button
                  key={material}
                  className="tool"
                  disabled={game.money < MATERIAL_ORDER_COST[material]}
                  onClick={() => setGame((g) => orderMaterials(g, material))}
                >
                  <b>Order {material}</b>
                  <small>+{MATERIAL_ORDER_AMOUNT} · ${MATERIAL_ORDER_COST[material].toLocaleString()}</small>
                </button>
              ))}
            </div>
            {game.deliveries.length > 0 ? (
              <ul className="deliveries" aria-label="Incoming material deliveries">
                {game.deliveries.map((delivery, index) => (
                  <li key={`${delivery.material}-${index}`}>
                    {delivery.material === 'wood' ? '🪵' : '🪨'} {delivery.quantity} {delivery.material} · arrives in {delivery.remaining}s
                  </li>
                ))}
              </ul>
            ) : (
              <small className="no-deliveries">No deliveries in transit</small>
            )}
            <small>Delivery takes {MATERIAL_DELIVERY_TIME} seconds.</small>
          </div>
          <div className="panel">
            <h2>Workers</h2>
            <small className="hint">Hire workers for parallel construction. A Workshop halves hiring costs.</small>
            <div className="tools">
              {WORKER_HIRE_COSTS.map((_, index) => {
                const workers = index + 1
                const cost = workerHireCost(game, workers)
                return (
                  <button key={workers} className="tool" disabled={game.money < cost} onClick={() => setGame((g) => hireWorkers(g, workers))}>
                    <b>Hire {workers} worker{workers === 1 ? '' : 's'}</b>
                    <small>${cost.toLocaleString()}</small>
                  </button>
                )
              })}
            </div>
          </div>
          {workshopBuilt && (
            <div className="panel training-panel">
              <h2>Workshop training</h2>
              <button className="tool" disabled={game.efficiencyTrained || game.money < EFFICIENCY_TRAINING_COST} onClick={() => setGame(trainEfficiency)}>
                <b>⚙️ Efficiency Training</b>
                <small>{game.efficiencyTrained ? 'Trained · construction speed doubled' : `$${EFFICIENCY_TRAINING_COST.toLocaleString()} · doubles construction speed`}</small>
              </button>
            </div>
          )}
          <div className="panel">
            <h2>Buildings guide</h2>
            <small className="hint">Tap an empty lot on the map to build.</small>
            <div className="tools">
              {BUILDING_ORDER.map((t) => {
                const def = BUILDINGS[t]
                return (
                  <div key={t} className={'tool info' + (canBuild(game, t) ? '' : ' poor')} title={def.desc}>
                    <b>{def.icon} {def.name}</b>
                    <small>${def.cashCost.toLocaleString()} · {costLabel(t)} · {def.buildTime}s</small>
                    <small>{def.desc}</small>
                    {t === 'workshop' && builders(game) < 3 && <small>Requires 3 workers ({builders(game)}/3)</small>}
                  </div>
                )
              })}
            </div>
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

      {sel?.type && (
        <div className="overlay" onClick={() => setSelectedBuilding(null)}>
          <div className="modal build-modal" role="dialog" aria-modal="true" aria-labelledby="manage-title" onClick={(event) => event.stopPropagation()}>
            <h2 id="manage-title">{BUILDINGS[sel.type].icon} {BUILDINGS[sel.type].name}</h2>
            <div className="manage-art"><BuildingArt type={sel.type} level={sel.level} /></div>
            <p>Level {sel.level + 1}/{MAX_UPGRADE + 1} · Condition {sel.condition}%{sel.sold ? ' · Sold' : ''}</p>
            {sel.sold ? (
              <p>This property was sold and no longer earns you income.</p>
            ) : (
              <div className="build-options">
                <button className="tool" disabled={sel.level >= MAX_UPGRADE || game.money < upgradeCost(sel)} onClick={() => act(upgrade)}>
                  <b>⬆️ Upgrade</b>
                  <small>{sel.level >= MAX_UPGRADE ? 'Max level' : `$${upgradeCost(sel).toLocaleString()}`}</small>
                </button>
                <button className="tool" disabled={sel.condition >= 100 || game.money < maintainCost(sel)} onClick={() => act(maintain)}>
                  <b>🔧 Maintain</b>
                  <small>{sel.condition >= 100 ? 'In perfect shape' : `$${maintainCost(sel).toLocaleString()}`}</small>
                </button>
                {sel.type === 'house' && workshopBuilt && (
                  <button className="tool" disabled={sel.inspected === true} onClick={() => act(inspect)}>
                    <b>🔍 Inspect house</b>
                    <small>{sel.inspected ? 'Protected from next damage check' : 'Prevents the next condition loss'}</small>
                  </button>
                )}
                <button className="tool" disabled={!isOwned(sel)} onClick={() => act(sell, true)}>
                  <b>💵 Sell</b>
                  <small>Get ${salePrice(sel).toLocaleString()}</small>
                </button>
                <button className="tool" onClick={() => act(demolish, true)}>
                  <b>💥 Demolish</b>
                  <small>Refunds 50% of base cost</small>
                </button>
              </div>
            )}
            <button className="cancel-build" onClick={() => setSelectedBuilding(null)}>Close</button>
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
                const affordable = canBuild(game, type)
                return (
                  <button key={type} className={'tool' + (affordable && free > 0 ? '' : ' poor')} disabled={!affordable || free <= 0} onClick={() => constructAt(type)}>
                    <b>{def.icon} {def.name}</b>
                    <small>${def.cashCost.toLocaleString()} · {costLabel(type)} · {def.buildTime}s</small>
                    <small>{def.desc}</small>
                    {type === 'workshop' && builders(game) < 3 && <small>Requires 3 workers ({builders(game)}/3)</small>}
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
