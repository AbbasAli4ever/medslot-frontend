"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";

/*
 * Right-hand panel of the login page. The collage grid and the 0.3s ease-in fade at
 * scale 0.9 follow Maze's login; every card is our own code-drawn clinic scene.
 */

/** Runs `tick` every `ms` while the tab is visible and motion is allowed. */
function useTicker(ms: number, tick: () => void) {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      if (!document.hidden) tick();
    }, ms);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ms, reduce]);
}

const card = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 260, damping: 26 } },
};

export function LoginShowcase() {
  return (
    <div className="relative hidden flex-1 overflow-hidden bg-[#c9f5de] lg:flex">
      <PatternBackground />
      <div className="relative z-[1] flex w-full items-center justify-center p-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeIn" }}
          className="scale-90 xl:scale-100"
        >
          <motion.div
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }}
            initial="hidden"
            animate="show"
            className="grid w-[540px] grid-cols-3 grid-rows-[112px_112px_96px_112px] gap-2"
            style={{
              gridTemplateAreas: `"doc slots phone" "doc pulse phone" "cal cal phone" "cal cal stat"`,
            }}
            aria-hidden="true"
          >
            <DoctorCard />
            <SlotsCard />
            <PulseCard />
            <PhoneCard />
            <CalendarCard />
            <StatCard />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ backdrop */

function PatternBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* soft light wash */}
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_70%_20%,#e7fbef_0%,transparent_70%)]" />
      {/* dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(4,120,87,0.13)_1.6px,transparent_1.8px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      {/* drifting crosses */}
      <div className="animate-[medslot-drift_40s_linear_infinite] absolute -inset-[120px] opacity-60 [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cpath d=%22M60 50v20M50 60h20%22 stroke=%22%2310b981%22 stroke-opacity=%22.35%22 stroke-width=%224%22 stroke-linecap=%22round%22/%3E%3C/svg%3E')] [background-size:120px_120px] [mask-image:linear-gradient(to_top,black,transparent_75%)] motion-reduce:animate-none" />
    </div>
  );
}

/* ------------------------------------------------------------------- cards */

function DoctorCard() {
  return (
    <motion.div variants={card} style={{ gridArea: "doc" }} className="relative overflow-hidden rounded-xl bg-[#a7ecc8]">
      <motion.div
        className="absolute inset-0"
        animate={{ scale: [1.04, 1.1, 1.04] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image src="/illustrations/doctor-sara.png" alt="" fill sizes="180px" className="object-cover" priority />
      </motion.div>
      <div className="absolute inset-x-2 bottom-2 flex items-center justify-between rounded-lg bg-white/90 px-2 py-1.5 backdrop-blur">
        <span className="text-[10px] font-semibold text-ink">Dr. Sara</span>
        <span className="flex items-center gap-1 text-[9px] font-medium text-emerald-700">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          On duty
        </span>
      </div>
    </motion.div>
  );
}

const SLOT_TIMES = ["09:30", "10:00", "11:30"];

function SlotsCard() {
  const [active, setActive] = useState(0);
  useTicker(1400, () => setActive((i) => (i + 1) % SLOT_TIMES.length));
  return (
    <motion.div variants={card} style={{ gridArea: "slots" }} className="flex flex-col justify-center gap-2 rounded-xl bg-white p-3">
      <p className="text-[9px] font-semibold tracking-wide text-muted uppercase">Next free slots</p>
      <div className="flex gap-1">
        {SLOT_TIMES.map((t, i) => (
          <span key={t} className="relative flex-1 rounded-md py-1 text-center text-[10px] font-semibold">
            {i === active && (
              <motion.span
                layoutId="showcase-slot"
                className="absolute inset-0 rounded-md bg-emerald-600"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className={`relative transition-colors ${i === active ? "text-white" : "text-emerald-700"}`}>{t}</span>
          </span>
        ))}
      </div>
      <div className="h-1.5 w-2/3 rounded-full bg-zinc-100" />
    </motion.div>
  );
}

const ECG = "M0 30 H34 L40 22 L46 30 H56 L62 6 L70 50 L76 30 H92 L98 24 L104 30 H155";

function PulseCard() {
  return (
    <motion.div
      variants={card}
      style={{ gridArea: "pulse" }}
      className="relative overflow-hidden rounded-xl bg-emerald-600 bg-[radial-gradient(circle,rgba(255,255,255,0.18)_1px,transparent_1.2px)] [background-size:8px_8px]"
    >
      <svg viewBox="0 0 155 60" className="absolute inset-x-0 top-1/2 w-full -translate-y-1/2" fill="none">
        <path d={ECG} stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
        <motion.path
          d={ECG}
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, pathOffset: 0 }}
          animate={{ pathLength: [0, 0.35, 0.35], pathOffset: [0, 0.65, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear", times: [0, 0.65, 1] }}
        />
      </svg>
      <span className="absolute top-2 left-2.5 text-[10px] font-semibold text-white/90">72 bpm</span>
    </motion.div>
  );
}

const QUEUE = [
  { name: "Ayesha K.", time: "09:00", doc: "Dr. Ali", tone: "bg-sky-100 text-sky-700" },
  { name: "Bilal R.", time: "09:30", doc: "Dr. Sara", tone: "bg-amber-100 text-amber-700" },
  { name: "Hina S.", time: "10:00", doc: "Dr. Usman", tone: "bg-rose-100 text-rose-700" },
  { name: "Omar F.", time: "10:30", doc: "Dr. Ali", tone: "bg-violet-100 text-violet-700" },
  { name: "Zara M.", time: "11:00", doc: "Dr. Sara", tone: "bg-teal-100 text-teal-700" },
];

function PhoneCard() {
  const [start, setStart] = useState(0);
  useTicker(2600, () => setStart((s) => (s + 1) % QUEUE.length));
  const rows = [0, 1, 2, 3].map((k) => QUEUE[(start + k) % QUEUE.length]);

  return (
    <motion.div variants={card} style={{ gridArea: "phone" }} className="flex items-center justify-center rounded-xl bg-emerald-900 p-3">
      <div className="flex h-full w-full flex-col overflow-hidden rounded-[18px] bg-white shadow-xl shadow-black/30">
        <div className="flex items-center justify-between bg-emerald-600 px-3 pt-3 pb-2 text-white">
          <span className="text-[10px] font-semibold">Today</span>
          <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[8px] font-medium">Tue 10</span>
        </div>
        <div className="flex justify-between bg-emerald-600 px-2 pb-2.5">
          {["M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span
              key={i}
              className={`grid size-4 place-items-center rounded-full text-[8px] font-semibold ${
                i === 1 ? "bg-white text-emerald-700" : "text-white/80"
              }`}
            >
              {d}
            </span>
          ))}
        </div>
        <div className="relative flex-1 space-y-1.5 overflow-hidden p-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {rows.map((r) => (
              <motion.div
                key={r.name}
                layout
                initial={{ opacity: 0, y: -14, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="flex items-center gap-1.5 rounded-lg border border-line px-1.5 py-1.5"
              >
                <span className={`grid size-5 shrink-0 place-items-center rounded-full text-[8px] font-bold ${r.tone}`}>
                  {r.name[0]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[9px] font-semibold text-ink">{r.name}</span>
                  <span className="block truncate text-[8px] text-muted">
                    {r.doc} · {r.time}
                  </span>
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function CalendarCard() {
  const [day, setDay] = useState(9);
  const [confirmKey, setConfirmKey] = useState(0);
  useTicker(3000, () => {
    setDay((d) => (d >= 13 ? 9 : d + 1));
    setConfirmKey((k) => k + 1);
  });
  const days = Array.from({ length: 18 }, (_, i) => i + 2);

  return (
    <motion.div variants={card} style={{ gridArea: "cal" }} className="relative overflow-hidden rounded-xl bg-[#86dcb1] p-3">
      <div className="h-full w-[62%] rounded-lg bg-white p-2.5 shadow-sm">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-ink">November</span>
          <span className="h-1.5 w-8 rounded-full bg-emerald-100" />
        </div>
        <div className="grid grid-cols-6 gap-1">
          {days.map((d) => {
            const sunday = (d - 1) % 7 === 0;
            const selected = d === day;
            return (
              <span key={d} className="relative grid h-[22px] place-items-center text-[9px] font-medium">
                {selected && (
                  <motion.span
                    layoutId="showcase-day"
                    className="absolute inset-0 rounded-md bg-emerald-600"
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                  />
                )}
                <span className={`relative ${selected ? "text-white" : sunday ? "text-zinc-300" : "text-ink"}`}>{d}</span>
              </span>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={confirmKey}
          initial={{ opacity: 0, y: 18, rotate: 0 }}
          animate={{ opacity: 1, y: 0, rotate: -5 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="absolute top-8 right-3 w-[42%] rounded-xl border-2 border-emerald-600 bg-white p-2.5 shadow-lg shadow-emerald-900/15"
        >
          <svg viewBox="0 0 24 24" className="mb-1.5 size-6" fill="none">
            <circle cx="12" cy="12" r="11" fill="#d1fae5" />
            <motion.path
              d="M7 12.5l3.2 3.2L17 9"
              stroke="#059669"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45, delay: 0.25, ease: "easeOut" }}
            />
          </svg>
          <p className="text-[10px] leading-tight font-semibold text-ink">Appointment booked</p>
          <p className="mt-0.5 text-[9px] text-muted">Nov {day} · 10:30 · 30 min</p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function StatCard() {
  const [booked, setBooked] = useState(4);
  useTicker(2600, () => setBooked((b) => (b >= 9 ? 4 : b + 1)));
  const free = 16 - booked;

  return (
    <motion.div variants={card} style={{ gridArea: "stat" }} className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white px-3">
      <p className="text-[9px] text-muted">Dr. Ali · today</p>
      <p className="text-[22px] leading-none font-extrabold tracking-tight text-emerald-700 tabular-nums">
        {free}
        <span className="text-zinc-300"> / </span>
        <span className="text-ink">{booked}</span>
      </p>
      <div className="flex w-full gap-2 text-[8px] text-muted">
        <span className="flex-1">
          <motion.span className="mb-0.5 block h-1 rounded-full bg-emerald-500" animate={{ width: `${(free / 16) * 100}%` }} />
          free
        </span>
        <span className="flex-1 text-right">
          <motion.span className="mb-0.5 ml-auto block h-1 rounded-full bg-ink" animate={{ width: `${(booked / 16) * 100}%` }} />
          booked
        </span>
      </div>
    </motion.div>
  );
}
