import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useModal } from '../hooks/useModal'

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  )
}

/*
  Shared popup used by ProjectModal and SkillModal.

  open               show / hide (exit animation plays when this turns false)
  onClose            called on Escape, backdrop click and the close button
  label              accessible name of the dialog
  origin             { dx, dy } offset from the screen centre the popup grows out of
  overlayClassName   class for the dark backdrop
  panelClassName     class for the popup card
  closeClassName     class for the close button
  panelStyle         extra inline style for the card (e.g. CSS variables)
  onOpened           called once the open animation has finished
*/
export default function Modal({
  open,
  onClose,
  label,
  origin,
  overlayClassName,
  panelClassName,
  closeClassName,
  closeLabel = 'Close dialog',
  panelStyle,
  onOpened,
  children,
}) {
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  const openRef = useRef(open)
  openRef.current = open

  useModal({ open, onClose, panelRef, initialFocusRef: closeRef })

  const dx = origin?.dx ?? 0
  const dy = origin?.dy ?? 0

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={overlayClassName}
          role="presentation"
          // Scroll container + contain = wheel / touch scrolling can't reach the page behind.
          style={{ overflowY: 'auto', overscrollBehavior: 'contain' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            ref={panelRef}
            className={panelClassName}
            style={panelStyle}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            // Grows out of the spot that was clicked, then settles in the centre.
            // Only transform + opacity are animated, so it stays on the GPU.
            initial={{ opacity: 0, scale: 0.4, x: dx, y: dy }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, x: dx * 0.4, y: dy * 0.4 }}
            transition={{
              type: 'spring',
              stiffness: 320,
              damping: 30,
              mass: 0.8,
              opacity: { duration: 0.15 },
            }}
            onAnimationComplete={() => {
              if (openRef.current) onOpened?.()
            }}
          >
            <button
              ref={closeRef}
              type="button"
              className={closeClassName}
              onClick={onClose}
              aria-label={closeLabel}
            >
              <CloseIcon />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}