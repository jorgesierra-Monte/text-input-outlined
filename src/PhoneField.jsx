import { useState, useRef, useEffect } from 'react'
import styles from './PhoneField.module.css'
import { COUNTRIES } from './countries'

// Regional-indicator flag emoji from an ISO 3166-1 alpha-2 code
const flagEmoji = iso =>
  iso.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)))

export default function PhoneField({ label = 'Phone number' }) {
  const [iso, setIso] = useState('US')
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const inputRef = useRef(null)
  const wrapRef = useRef(null)

  const active = focused || open          // drives the border (focus ring)
  const filled = value.length > 0
  const state = active
    ? filled ? 'typing' : 'focus'
    : filled ? 'filled'
    : hovered ? 'hover'
    : 'default'
  const showValue = focused || filled     // label floats + number shows

  // Close the country menu on outside click / Escape
  useEffect(() => {
    if (!open) return
    const onDown = e => { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    const onKey = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function pick(c) {
    setIso(c.iso)
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={wrapRef} className={styles.wrapper}>
      <div
        className={[styles.field, styles[state], showValue ? styles.showValue : ''].join(' ')}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          type="button"
          className={styles.country}
          onClick={() => setOpen(o => !o)}
          aria-label="Country code"
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className={styles.flag}>{flagEmoji(iso)}</span>
          <span className={[styles.chevron, open ? styles.chevronOpen : ''].join(' ')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </button>

        <span className={styles.divider} aria-hidden="true" />

        <span className={styles.label}>{label}</span>
        <input
          ref={inputRef}
          className={styles.input}
          type="tel"
          inputMode="tel"
          value={value}
          placeholder=""
          onChange={e => setValue(e.target.value.replace(/[^\d+()\-\s]/g, ''))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>

      {open && (
        <ul className={styles.dropdown} role="listbox" aria-label="Country">
          {COUNTRIES.map(c => (
            <li
              key={c.iso}
              className={[styles.option, c.iso === iso ? styles.optionSelected : ''].join(' ')}
              role="option"
              aria-selected={c.iso === iso}
              onMouseDown={e => e.preventDefault()} // prevent input blur before click
              onClick={() => pick(c)}
            >
              <span className={styles.optFlag}>{flagEmoji(c.iso)}</span>
              <span className={styles.optName}>{c.name}</span>
              <span className={styles.optDial}>{c.dial}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
