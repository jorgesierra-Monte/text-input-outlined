import { useState, useRef, useEffect } from 'react'
import styles from './SelectField.module.css'

export default function SelectField({ label, placeholder, options }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('')
  const [hovered, setHovered] = useState(false)
  const containerRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (!containerRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  const state = open ? 'open' : selected ? 'filled' : hovered ? 'hover' : 'default'

  function handleSelect(option) {
    // Clicking the already-selected row deselects it (back to default)
    setSelected(prev => (prev === option ? '' : option))
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={styles.wrapper}>
      <div
        className={[styles.field, styles[state]].join(' ')}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setOpen(o => !o)}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o) } }}
      >
        <div className={styles.content}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{selected}</span>
        </div>
        <span className={[styles.chevron, open ? styles.chevronOpen : ''].join(' ')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>

      {open && (
        <ul className={styles.dropdown} role="listbox">
          {options.map(option => (
            <li
              key={option}
              className={[styles.option, selected === option ? styles.optionSelected : ''].join(' ')}
              role="option"
              aria-selected={selected === option}
              onMouseDown={e => e.preventDefault()} // prevent blur before click
              onClick={() => handleSelect(option)}
            >
              <span className={styles.optionLabel}>{option}</span>
              {selected === option && (
                <span className={styles.check} aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
