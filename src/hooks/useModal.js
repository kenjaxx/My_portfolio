import { useEffect, useRef } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/*
  Shared behaviour for dialogs:
  - Escape closes the dialog
  - Tab / Shift+Tab stay inside the dialog (focus trap)
  - the rest of the page (#root) is made `inert`, so it can't be focused,
    clicked or read by screen readers while the dialog is open
  - focus moves into the dialog on open and returns to the element that
    opened it on close

  Page scrolling is blocked by CSS (`overscroll-behavior: contain` on the
  overlay, set in Modal.jsx), so no wheel / touchmove listeners are needed.
*/
export function useModal({ open, onClose, panelRef, initialFocusRef, rootSelector = '#root' }) {
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return undefined

    const trigger = document.activeElement
    const root = document.querySelector(rootSelector)
    root?.setAttribute('inert', '')

    const target = initialFocusRef?.current ?? panelRef.current
    target?.focus({ preventScroll: true })

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current?.()
        return
      }
      if (e.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return

      const nodes = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      )
      if (nodes.length === 0) {
        e.preventDefault()
        panel.focus({ preventScroll: true })
        return
      }

      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement

      if (!panel.contains(active)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      root?.removeAttribute('inert')
      if (trigger && trigger !== document.body && trigger.isConnected) {
        trigger.focus({ preventScroll: true })
      }
    }
  }, [open, panelRef, initialFocusRef, rootSelector])
}