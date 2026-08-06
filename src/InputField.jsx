import { useState, useRef } from 'react'
import styles from './InputField.module.css'

export default function InputField({ label, placeholder, defaultValue = '' }) {
  const [value, setValue] = useState(defaultValue)
  const [focused, setFocused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const inputRef = useRef(null)

  const state = focused
    ? value ? 'typing' : 'focus'
    : value ? 'filled'
    : hovered ? 'hover'
    : 'default'

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
        className={styles.input}
        value={value}
        placeholder=""
        onChange={e => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  )
}
