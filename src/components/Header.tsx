"use client";

import { motion } from "motion/react";
import type { StaffUser } from "@/lib/auth";
import { AccountMenu } from "./AccountMenu";
import { Logo } from "./brand/Logo";
import { PlusIcon } from "./icons";
import { Button } from "./ui/Button";

interface HeaderProps {
  onBook: () => void;
  user: StaffUser;
  onLogout: () => void;
}

export function Header({ onBook, user, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/80 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 md:h-16">
        <Logo size={30} />
        <div className="flex items-center gap-3">
          {/* Phones use the floating pill at the bottom instead. */}
          <div className="hidden md:block">
            <Button variant="primary" onClick={onBook}>
              <PlusIcon />
              Book appointment
            </Button>
          </div>
          <AccountMenu user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
}

/** Phones: thumb-reachable full-width booking pill, above the home indicator. */
export function FloatingBookButton({ onBook }: { onBook: () => void }) {
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.15 }}
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(env(safe-area-inset-bottom),16px)] md:hidden"
    >
      <Button
        variant="primary"
        size="lg"
        onClick={onBook}
        className="w-full shadow-lg shadow-emerald-900/20"
      >
        <PlusIcon />
        Book appointment
      </Button>
    </motion.div>
  );
}
