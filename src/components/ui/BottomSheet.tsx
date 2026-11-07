"use client";

import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useDialog } from "@/hooks/useDialog";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
}

const DISMISS_OFFSET = 120;
const DISMISS_VELOCITY = 600;

/** Phone bottom sheet with a grab handle; drag down to dismiss. */
export function BottomSheet({ open, onClose, labelledBy, children }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <SheetPanel onClose={onClose} labelledBy={labelledBy}>
          {children}
        </SheetPanel>
      )}
    </AnimatePresence>
  );
}

function SheetPanel({ onClose, labelledBy, children }: Omit<BottomSheetProps, "open">) {
  const sheetRef = useRef<HTMLDivElement>(null);
  useDialog(sheetRef, onClose);

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > DISMISS_OFFSET || info.velocity.y > DISMISS_VELOCITY) onClose();
  }

  return (
    <div className="fixed inset-0 z-50">
      <motion.div
        className="absolute inset-0 bg-zinc-900/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={onDragEnd}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="absolute inset-x-0 bottom-0 max-h-[90dvh] overflow-y-auto rounded-t-3xl bg-white pb-[max(env(safe-area-inset-bottom),16px)] shadow-2xl outline-none"
      >
        <div className="sticky top-0 flex justify-center bg-white pt-3 pb-2" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-zinc-200" />
        </div>
        {children}
      </motion.div>
    </div>
  );
}
