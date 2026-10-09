import { useEffect, useRef, useState } from 'react'
import { BUILDINGS, BUILDING_ORDER, LEVELS, LOT_COST, MATERIAL_DELIVERY_TIME, MATERIAL_ORDERS, MAX_UPGRADE, PAINT_COLORS, TICKS_PER_DAY, WORKER_HIRE_COSTS } from './game/data'
import BuildingArt from './game/BuildingArt'
import LotArt from './game/LotArt'
import { advanceDeliveries, build, builders, busyBuilders, buyLot, canBuild, changePaintColor, demolish, goalProgress, hasSawmill, hasWorkshop, hireWorkers, houseValue, improvementCost, isOwned, landscape, maintain, maintenanceCost, newGame, nextLevel, orderMaterials, paintBuilding, rentalIncome, sell, tick, upgrade, upgradeCost, workerHireCost } from './game/logic'
import { clearSave, loadGame, saveGame } from './game/storage'
import type { BuildingType, GameState } from './game/types'

type Tool = 'build' | 'demolish'

export default function App() {
  const [game, setGame] = useState<GameState>(loadGame)
  const [tool, setTool] = useState<Tool>('build')
  const [selectedLot, setSelectedLot] = useState<number | null>(null)
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)
  const previousMoney = useRef(game.money)

  useEffect(() => {
    const id = setInterval(() => {
      if (!paused) setGame(tick)
    }, 1000)
    return () => clearInterval(id)
  }, [paused])
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setGame(advanceDeliveries), 500)
    return () => clearInterval(id)
  }, [paused])
  useEffect(() => saveGame(game), [game])
  useEffect(() => {
    if (game.money > previousMoney.current) {
      const context = new AudioContext()
      const oscillator = context.createOscillator()
      const volume = context.createGain()
      const now = context.currentTime
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, now)
      oscillator.frequency.setValueAtTime(1320, now + 0.08)
      volume.gain.setValueAtTime(0.0001, now)
      volume.gain.exponentialRampToValueAtTime(0.12, now + 0.02)
      volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.2)
      oscillator.connect(volume)
      volume.connect(context.destination)
      oscillator.start(now)
      oscillator.stop(now + 0.2)
      oscillator.onended = () => void context.close()
    }
    previousMoney.current = game.money
  }, [game.money])

  const size = Math.sqrt(game.grid.length)
  const rent = rentalIncome(game)
  const goals = goalProgress(game)
  const free = builders(game) - busyBuilders(game)
  const gameDay = Math.floor(game.ticks / TICKS_PER_DAY) + 1
  const gameHour = Math.floor((game.ticks % TICKS_PER_DAY) * 24 / TICKS_PER_DAY)
  const trackedDelivery = game.deliveries.reduce((soonest, delivery) =>
    !soonest || delivery.remaining < soonest.remaining ? delivery : soonest, undefined as GameState['deliveries'][number] | undefined)
  const deliveryDuration = trackedDelivery?.duration ?? MATERIAL_DELIVERY_TIME
  const deliveryProgress = trackedDelivery
    ? Math.min(100, Math.max(0, (deliveryDuration - trackedDelivery.remaining) / deliveryDuration * 100))
    : 0

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
    `${BUILDINGS[type].cost.toLocaleString()} materials`

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
        <span>🧱 {Math.floor(game.resources.materials)} materials</span>
        <span>👷 {free}/{builders(game)}</span>
      </div>

      <main>
        <div className="board-wrap">
        <section className="board" aria-label="Neighborhood building lots" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
          {game.grid.map((c, i) => (
            <button
              key={i}
              className={'cell' + (c.type ? (c.remaining ? ' building' : c.sold ? ' built sold' : ' built') : c.lotOwned ? '' : ' unowned')}
              onClick={() => onCell(i)}
              aria-label={c.type ? `${BUILDINGS[c.type].name}${c.remaining ? `, ${c.upgradePending ? 'upgrade' : 'construction'} in progress, ${c.remaining} seconds left` : c.sold ? `, level ${c.level + 1}, sold` : `, level ${c.level + 1}`}` : c.lotOwned ? 'Owned empty lot' : `Unowned lot, $${LOT_COST.toLocaleString()}`}
            >
              <LotArt owned={c.lotOwned} built={!!c.type} />
              {c.type && (
                <BuildingArt
                  type={c.type}
                  level={c.level}
                  paintColor={c.paintColor}
                  progress={c.remaining > 0 ? ((c.taskDuration ?? BUILDINGS[c.type].buildTime) - c.remaining) / (c.taskDuration ?? BUILDINGS[c.type].buildTime) : 1}
                />
              )}
              {c.sold && <span className="timer sold-tag">Sold</span>}
              {c.type && c.remaining > 0 && (
                <span className="timer">
                  {c.upgradePending
                    ? `Upgrading · ${c.remaining}s`
                    : ((c.taskDuration ?? BUILDINGS[c.type].buildTime) - c.remaining) / (c.taskDuration ?? BUILDINGS[c.type].buildTime) < 0.25
                      ? 'Foundation'
                      : ((c.taskDuration ?? BUILDINGS[c.type].buildTime) - c.remaining) / (c.taskDuration ?? BUILDINGS[c.type].buildTime) < 0.55
                        ? 'Building'
                        : 'Nearly complete'}{!c.upgradePending && ` · ${c.remaining}s`}
                </span>
              )}
            </button>
          ))}
        </section>
        <div className="dock" role="toolbar" aria-label="Quick actions">
          <button className={'dock-btn danger' + (tool === 'demolish' ? ' active' : '')} onClick={() => setTool((t) => (t === 'demolish' ? 'build' : 'demolish'))} aria-pressed={tool === 'demolish'}><span>💥</span>{tool === 'demolish' ? 'Tap building' : 'Demolish'}</button>
          <button className="dock-btn" onClick={() => setPaused((value) => !value)} aria-pressed={paused}><span>{paused ? '▶' : '⏸'}</span>{paused ? 'Resume' : 'Pause'}</button>
        </div>
        {trackedDelivery && (
          <div className="delivery-tracker" role="progressbar" aria-label={`Delivery of ${trackedDelivery.quantity} materials`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(deliveryProgress)}>
            <span className="delivery-progress-fill" style={{ width: `${deliveryProgress}%` }} />
          </div>
        )}
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
            <div className="material-inventory"><span>🧱 Materials <b>{Math.floor(game.resources.materials)}</b></span></div>
            <div className="tools">
              {MATERIAL_ORDERS.map((order) => {
                const cost = hasSawmill(game) ? Math.floor(order.cost / 2) : order.cost
                return (
                  <button key={order.quantity} className="tool" disabled={game.money < cost} onClick={() => setGame((g) => orderMaterials(g, order))}>
                    <b>Order {order.quantity.toLocaleString()}</b>
                    <small>${cost.toLocaleString()} · ${Math.round(cost / order.quantity).toLocaleString()} per material</small>
                  </button>
                )
              })}
            </div>
            {game.deliveries.length > 0 && (
              <ul className="deliveries" aria-label="Incoming material deliveries">
                {game.deliveries.map((delivery, index) => (
                  <li key={index}>
                    🧱 {delivery.quantity} materials
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="panel">
            <h2>Workers</h2>
            <small className="hint">{hasWorkshop(game) ? 'Workshop halves worker hiring costs. ' : ''}Buildings require the listed number of workers while under construction.</small>
            <div className="tools">
              {WORKER_HIRE_COSTS.map((_, index) => {
                const workers = index + 1
                const cost = workerHireCost(workers, hasWorkshop(game))
                return (
                  <button key={workers} className="tool" disabled={game.money < cost} onClick={() => setGame((g) => hireWorkers(g, workers))}>
                    <b>Hire {workers} worker{workers === 1 ? '' : 's'}</b>
                    <small>${cost.toLocaleString()}</small>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="panel">
            <h2>Buildings guide</h2>
            <small className="hint">Buy a lot for ${LOT_COST.toLocaleString()}, then choose a building.</small>
            <div className="tools">
              {BUILDING_ORDER.map((t) => {
                const def = BUILDINGS[t]
                return (
                  <div key={t} className={'tool info' + (canBuild(game, t) ? '' : ' poor')} title={def.desc}>
                    <b>{def.icon} {def.name}</b>
                    <small>{costLabel(t)} · {def.workers} worker{def.workers === 1 ? '' : 's'}</small>
                    <small>{def.desc}</small>
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
            <div className="manage-art"><BuildingArt type={sel.type} level={sel.level} paintColor={sel.paintColor} /></div>
            <p>Level {sel.level + 1}/{MAX_UPGRADE + 1} · Condition {sel.condition}%{sel.upgradePending ? ` · Upgrading (${sel.remaining}s left)` : ''}{sel.painted ? ` · Painted ${PAINT_COLORS.find(({ id }) => id === sel.paintColor)?.name ?? PAINT_COLORS[0].name}` : ''}{sel.landscaped ? ' · Landscaped' : ''}{sel.sold ? ' · Sold' : ''}</p>
            <p>Current value: ${houseValue(sel).toLocaleString()}</p>
            {sel.sold ? (
              <p>This property was sold and no longer earns you income.</p>
            ) : (
              <div className="build-options">
                {sel.painted && PAINT_COLORS.map(({ id, name, value }) => (
                  <button
                    key={id}
                    type="button"
                    aria-label={`Change paint color to ${name}`}
                    aria-pressed={sel.paintColor === id}
                    title={`Change paint color to ${name}`}
                    onClick={() => act((g, i) => changePaintColor(g, i, id))}
                    style={{ backgroundColor: value, outline: sel.paintColor === id ? '3px solid #2b3a1f' : undefined }}
                  >
                    {name}
                  </button>
                ))}
                <button className="tool" disabled={sel.remaining > 0 || sel.level >= MAX_UPGRADE || game.resources.materials < upgradeCost(sel.type, sel.level) || free < BUILDINGS[sel.type].workers} onClick={() => act(upgrade)}>
                  <b>⬆️ Upgrade</b>
                  <small>{sel.level >= MAX_UPGRADE ? 'Max level' : `+10% value · ${upgradeCost(sel.type, sel.level).toLocaleString()} materials · ${BUILDINGS[sel.type].upgradeTime}s · ${BUILDINGS[sel.type].workers} workers`}</small>
                </button>
                <button className="tool" disabled={sel.remaining > 0 || sel.painted || game.resources.materials < improvementCost(sel.type)} onClick={() => act(paintBuilding)}>
                  <b>🎨 Paint</b>
                  <small>{sel.painted ? 'Already painted' : `+5% value · ${improvementCost(sel.type)} materials`}</small>
                </button>
                <button className="tool" disabled={sel.remaining > 0 || sel.landscaped || game.resources.materials < improvementCost(sel.type)} onClick={() => act(landscape)}>
                  <b>🌿 Landscape</b>
                  <small>{sel.landscaped ? 'Already landscaped' : `+5% value · ${improvementCost(sel.type)} materials`}</small>
                </button>
                <button className="tool" disabled={sel.remaining > 0 || sel.condition >= 100 || game.resources.materials < maintenanceCost(sel.type)} onClick={() => act(maintain)}>
                  <b>🔧 Maintain</b>
                  <small>{sel.condition >= 100 ? 'In perfect shape' : `Restore condition · ${maintenanceCost(sel.type)} materials`}</small>
                </button>
                <button className="tool" disabled={!isOwned(sel)} onClick={() => act(sell, true)}>
                  <b>💵 Sell</b>
                  <small>Receive full value: ${houseValue(sel).toLocaleString()}</small>
                </button>
                <button className="tool" onClick={() => act(demolish, true)}>
                  <b>💥 Demolish</b>
                  <small>Returns 60% of materials</small>
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
            {game.grid[selectedLot] && !game.grid[selectedLot].lotOwned ? (
              <>
                <h2 id="build-title">Buy lot {selectedLot + 1}</h2>
                <p>Purchase this empty lot for ${LOT_COST.toLocaleString()}.</p>
                <button disabled={game.money < LOT_COST} onClick={() => {
                  setGame((g) => buyLot(g, selectedLot))
                  setSelectedLot(null)
                }}>Buy lot · ${LOT_COST.toLocaleString()}</button>
              </>
            ) : (
              <>
                <h2 id="build-title">Choose a building</h2>
                <p>Lot {selectedLot + 1} · {free > 0 ? `${free} worker${free === 1 ? '' : 's'} available` : 'No workers available'}</p>
                <div className="build-options">
                  {BUILDING_ORDER.map((type) => {
                    const def = BUILDINGS[type]
                    const affordable = canBuild(game, type)
                    const enoughWorkers = free >= def.workers
                    return (
                      <button key={type} className={'tool' + (affordable && enoughWorkers ? '' : ' poor')} disabled={!affordable || !enoughWorkers} onClick={() => constructAt(type)}>
                        <b>{def.icon} {def.name}</b>
                        <small>{costLabel(type)}</small>
                        <small>{def.workers} worker{def.workers === 1 ? '' : 's'} · {def.buildTime}s</small>
                        <small>{def.desc}</small>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
            <button className="cancel-build" onClick={() => setSelectedLot(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
