import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './MotionControls.module.css'

// Easing presets — stored as cubic-bezier control points
const EASES = [
  { label: 'emphasized', p: [0.32, 0.72, 0, 1] },
  { label: 'entrance',   p: [0, 0, 0.38, 0.9] },
  { label: 'linear',     p: [0, 0, 1, 1] },
]

const cssEase = p => (p[0] === 0 && p[1] === 0 && p[2] === 1 && p[3] === 1)
  ? 'linear'
  : `cubic-bezier(${p.join(',')})`

// --- Cubic-bezier evaluator (Newton-Raphson, standard bezier-easing math) ---
function makeBezier(x1, y1, x2, y2) {
  const A = (a, b) => 1 - 3 * b + 3 * a
  const B = (a, b) => 3 * b - 6 * a
  const C = a => 3 * a
  const calc = (t, a, b) => ((A(a, b) * t + B(a, b)) * t + C(a)) * t
  const slope = (t, a, b) => 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a)

  function solveX(x) {
    let t = x
    for (let i = 0; i < 8; i++) {
      const xs = calc(t, x1, x2) - x
      const d = slope(t, x1, x2)
      if (Math.abs(d) < 1e-6) break
      t -= xs / d
    }
    return t
  }
  return x => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    return calc(solveX(x), y1, y2)
  }
}

const VIZ = 150            // svg viewBox size
const PAD = 18             // headroom so overshoot is visible
const SAMPLES = 60

export default function MotionControls() {
  const [duration, setDuration] = useState(160)
  const [easeIdx, setEaseIdx] = useState(0)
  const [minimized, setMinimized] = useState(false)
  const [pos, setPos] = useState(null) // null = use CSS default position
  const [progress, setProgress] = useState(0)

  const ease = EASES[easeIdx]

  // Push live values to the label-float animation
  useEffect(() => {
    document.documentElement.style.setProperty('--float-duration', `${duration}ms`)
  }, [duration])
  useEffect(() => {
    document.documentElement.style.setProperty('--float-ease', cssEase(ease.p))
  }, [ease])

  // Build the easing function + curve path for the current preset
  const fn = makeBezier(...ease.p)

  // map a unit value (0..1, may overshoot) to svg y (inverted, padded)
  const toY = v => PAD + (1 - v) * (VIZ - 2 * PAD)
  const toX = v => PAD + v * (VIZ - 2 * PAD)

  let curvePath = ''
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES
    const x = toX(t)
    const y = toY(fn(t))
    curvePath += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)} `
  }

  // --- Play the curve trace once whenever a new ease is selected ---
  useEffect(() => {
    let raf
    const playMs = Math.max(duration, 500)
    let start = null
    function tick(now) {
      if (start === null) start = now
      const t = Math.min((now - start) / playMs, 1)
      setProgress(t)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [easeIdx])

  const dotX = toX(progress)
  const dotY = toY(fn(progress))

  // --- Dragging ---
  const dragRef = useRef(null)
  const onPointerDown = useCallback(e => {
    const panel = e.currentTarget.closest(`.${styles.panel}`)
    const rect = panel.getBoundingClientRect()
    dragRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top, w: rect.width, h: rect.height }
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])
  const onPointerMove = useCallback(e => {
    if (!dragRef.current) return
    const { dx, dy, w, h } = dragRef.current
    const x = Math.min(Math.max(0, e.clientX - dx), window.innerWidth - w)
    const y = Math.min(Math.max(0, e.clientY - dy), window.innerHeight - h)
    setPos({ x, y })
  }, [])
  const onPointerUp = useCallback(e => {
    dragRef.current = null
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch (_) {}
  }, [])

  const panelStyle = pos ? { left: pos.x, top: pos.y, right: 'auto' } : undefined

  return (
    <div className={styles.panel} style={panelStyle}>
      <div
        className={styles.header}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <span className={styles.grip} aria-hidden="true">⠿</span>
        <span className={styles.title}>Motion</span>
        <button
          type="button"
          className={styles.iconBtn}
          onPointerDown={e => e.stopPropagation()}
          onClick={() => setMinimized(m => !m)}
          aria-label={minimized ? 'Expand' : 'Minimize'}
        >
          {minimized ? '+' : '–'}
        </button>
      </div>

      {!minimized && (
        <div className={styles.body}>
          {/* Visualizer */}
          <div className={styles.viz}>
            <svg className={styles.graph} viewBox={`0 0 ${VIZ} ${VIZ}`} width="100%">
              <line x1={PAD} y1={toY(0)} x2={VIZ - PAD} y2={toY(0)} className={styles.grid} />
              <line x1={PAD} y1={toY(1)} x2={VIZ - PAD} y2={toY(1)} className={styles.grid} />
              <line x1={toX(0)} y1={PAD} x2={toX(0)} y2={VIZ - PAD} className={styles.grid} />
              <line x1={toX(1)} y1={PAD} x2={toX(1)} y2={VIZ - PAD} className={styles.grid} />
              <path d={curvePath} className={styles.curve} />
              <circle cx={dotX} cy={dotY} r={4} className={styles.dot} />
            </svg>
          </div>

          {/* Easing preset buttons */}
          <div className={styles.easeGrid}>
            {EASES.map((e, i) => (
              <button
                key={e.label}
                type="button"
                className={[styles.easeBtn, i === easeIdx ? styles.active : ''].join(' ')}
                onClick={() => setEaseIdx(i)}
              >
                {e.label}
              </button>
            ))}
          </div>

          {/* Duration */}
          <div className={styles.durationRow}>
            <span className={styles.fieldLabel}>Duration</span>
            <input
              type="range"
              min={50}
              max={1000}
              step={10}
              value={Math.min(Math.max(duration, 50), 1000)}
              onChange={e => setDuration(Number(e.target.value))}
              className={styles.range}
            />
            <input
              type="number"
              min={0}
              step={10}
              value={duration}
              onChange={e => setDuration(e.target.value === '' ? 0 : Number(e.target.value))}
              onBlur={e => setDuration(Math.max(0, Number(e.target.value) || 0))}
              className={styles.numInput}
            />
            <span className={styles.unit}>ms</span>
          </div>
        </div>
      )}
    </div>
  )
}
