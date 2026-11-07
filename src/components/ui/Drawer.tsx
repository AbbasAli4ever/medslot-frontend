"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useDialog } from "@/hooks/useDialog";
import { useIsMobile } from "@/hooks/useMediaQuery";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  /** id of the element that labels the dialog. */
  labelledBy: string;
  children: ReactNode;
}

/**
 * Modal panel: slides in from the right on desktop and up as a full-screen
 * sheet on phones. Children unmount when closed, so form state resets on
 * every open.
 */
export function Drawer({ open, onClose, labelledBy, children }: DrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <DrawerPanel onClose={onClose} labelledBy={labelledBy}>
          {children}
        </DrawerPanel>
      )}
    </AnimatePresence>
  );
}

function DrawerPanel({ onClose, labelledBy, children }: Omit<DrawerProps, "open">) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  useDialog(panelRef, onClose);

  const hidden = isMobile ? { y: "100%" } : { x: "100%" };

  return (
    <div className="fixed inset-0 z-50">
      <motion.div
        className="absolute inset-0 bg-zinc-900/20 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-full max-w-[920px] flex-col bg-white shadow-2xl shadow-zinc-900/10 outline-none md:rounded-l-2xl"
        initial={hidden}
        animate={{ x: 0, y: 0 }}
        exit={hidden}
        transition={{ type: "spring", stiffness: 380, damping: 40 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
