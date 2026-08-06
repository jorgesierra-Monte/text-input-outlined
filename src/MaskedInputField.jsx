import { useState, useRef, useLayoutEffect } from 'react'
import styles from './InputField.module.css'

// Mask configs: template string + which indices are user-typed digit slots
export const PHONE_CONFIG = {
  template: '(000)-000-0000',
  digitPositions: [1, 2, 3, 6, 7, 8, 10, 11, 12, 13],
}

export const DATE_CONFIG = {
  template: 'MM/DD/YYYY',
  digitPositions: [0, 1, 3, 4, 6, 7, 8, 9],
}

function buildDisplay(digits, config) {
  const chars = config.template.split('')
  config.digitPositions.forEach((pos, i) => {
    if (i < digits.length) chars[pos] = digits[i]
  })
  return chars.join('')
}

export default function MaskedInputField({ label, config }) {
  const [digits, setDigits] = useState('')
  const [focused, setFocused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const inputRef = useRef(null)

  const maxLen = config.digitPositions.length

  const state = focused
    ? digits.length > 0 ? 'typing' : 'focus'
    : digits.length > 0 ? 'filled'
    : hovered ? 'hover'
    : 'default'

  // After every render while focused, snap cursor to the next open slot
  useLayoutEffect(() => {
    if (!focused || !inputRef.current) return
    const pos =
      digits.length < maxLen
        ? config.digitPositions[digits.length]       // next empty slot
        : config.digitPositions[maxLen - 1] + 1      // after last digit
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
    // all other keys (Tab, arrows, etc.) pass through naturally
  }

  const displayValue = digits.length > 0 || focused ? buildDisplay(digits, config) : ''

  return (
    <div
      className={[styles.field, styles[state]].join(' ')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => inputRef.current?.focus()}
    >
      <span className={styles.label}>{label}</span>
      <input
        ref={inputRef}
        className={[styles.input, digits.length === 0 && focused ? styles.masked : ''].join(' ')}
        value={displayValue}
        placeholder=""
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  )
}
