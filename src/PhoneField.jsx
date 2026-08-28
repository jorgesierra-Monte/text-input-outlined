import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import styles from './PhoneField.module.css'
import { COUNTRIES } from './countries'

// Flat SVG flag (flag-icons) for an ISO 3166-1 alpha-2 code
const Flag = ({ iso, className }) => (
  <span className={`fi fi-${iso.toLowerCase()} ${className}`} aria-hidden="true" />
)

// Phone number mask — same masking behavior as the Birth date field
const PHONE = { template: '(000)-000-0000', digitPositions: [1, 2, 3, 6, 7, 8, 10, 11, 12, 13] }

function buildDisplay(digits) {
  const chars = PHONE.template.split('')
  PHONE.digitPositions.forEach((pos, i) => {
    if (i < digits.length) chars[pos] = digits[i]
  })
  return chars.join('')
}

export default function PhoneField({ label = 'Phone number' }) {
  const [iso, setIso] = useState('US')
  const [digits, setDigits] = useState('')
  const [focused, setFocused] = useState(false)
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const inputRef = useRef(null)
  const wrapRef = useRef(null)

  const maxLen = PHONE.digitPositions.length
  const active = focused || open          // drives the border (focus ring)
  const filled = digits.length > 0
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

  // After every render while focused, snap cursor to the next open slot
  useLayoutEffect(() => {
    if (!focused || !inputRef.current) return
    const pos =
      digits.length < maxLen
        ? PHONE.digitPositions[digits.length]
        : PHONE.digitPositions[maxLen - 1] + 1
    inputRef.current.setSelectionRange(pos, pos)
  })

  function handleKeyDown(e) {
    if (/^\d$/.test(e.key)) {
      e.preventDefault()
      if (digits.length < maxLen) setDigits(d => d + e.key)
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      setDigits(d => d.slice(0, -1))
    }
  }

  function pick(c) {
    setIso(c.iso)
    setOpen(false)
    inputRef.current?.focus()
  }

  const displayValue = digits.length > 0 || focused ? buildDisplay(digits) : ''

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
          <Flag iso={iso} className={styles.flag} />
          <span className={styles.chevron}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </button>

        <span className={styles.divider} aria-hidden="true" />

        <span className={styles.label}>{label}</span>
        <input
          ref={inputRef}
          className={[styles.input, digits.length === 0 && focused ? styles.masked : ''].join(' ')}
          type="tel"
          inputMode="tel"
          value={displayValue}
          placeholder=""
          onChange={() => {}}
          onKeyDown={handleKeyDown}
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
              <Flag iso={c.iso} className={styles.optFlag} />
              <span className={styles.optName}>{c.name}</span>
              <span className={styles.optDial}>{c.dial}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
