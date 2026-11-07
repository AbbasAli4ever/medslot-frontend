"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import clsx from "clsx";
import { API_BASE_URL, errorMessage } from "@/lib/api";
import { DEMO_CREDENTIALS, login } from "@/lib/auth";
import { Spinner } from "@/components/ui/Spinner";

/*
 * Layout and measurements transcribed from Maze's login form (auth.maze.co/login):
 * 23/32 semibold heading with 40px gap, 16/24 labels, 8px field gaps, 12×16 input
 * padding, 8px radii, 0.5px inset hairline + 2px offset focus ring, 48px buttons,
 * 13px "OR" divider. Colours remapped from Maze blue to our emerald.
 */

const FIELD =
  "relative flex items-center rounded-lg bg-white text-ink transition-shadow duration-250 " +
  "shadow-[0_1px_2px_rgba(113,113,122,0.08),inset_0_0_0_0.5px_rgba(113,113,122,0.28)] " +
  "hover:[&:not(:focus-within)]:shadow-[0_1px_2px_rgba(5,150,105,0.08),inset_0_0_0_1px_rgba(5,150,105,0.28)] " +
  "after:pointer-events-none after:absolute after:-inset-[2px] after:rounded-[10px] after:shadow-[0_0_0_2px_transparent] " +
  "after:transition-shadow after:duration-250 focus-within:after:shadow-[0_0_0_2px_#047857]";

const INPUT =
  "w-full appearance-none rounded-[inherit] bg-transparent px-4 py-3 text-base leading-6 tracking-[-0.01em] " +
  "outline-none placeholder:text-zinc-400";

const BUTTON_BASE =
  "relative inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-[15px] py-[11px] " +
  "text-base leading-6 font-semibold tracking-[-0.01em] transition-[background-color,box-shadow,color] duration-150 " +
  "outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed";

const BUTTON_PRIMARY =
  "bg-emerald-600 text-white shadow-[0_1px_2px_rgba(5,150,105,0.08),inset_0_0_0_0.5px_rgba(5,150,105,0.28)] " +
  "hover:enabled:bg-emerald-700 disabled:bg-emerald-600/60";

const BUTTON_SECONDARY =
  "bg-white text-emerald-700 shadow-[0_1px_2px_rgba(5,150,105,0.08),inset_0_0_0_0.5px_rgba(5,150,105,0.28)] " +
  "hover:enabled:bg-emerald-50 hover:enabled:text-emerald-800 hover:enabled:shadow-[0_1px_2px_rgba(5,150,105,0.08),inset_0_0_0_1px_rgba(5,150,105,0.28)]";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const rise = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
};

export function LoginForm() {
  const router = useRouter();
  const shake = useAnimationControls();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState<"form" | "demo" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(creds: { email: string; password: string }, source: "form" | "demo") {
    setPending(source);
    setError(null);
    try {
      await login(creds.email.trim(), creds.password);
      router.replace("/");
    } catch (err) {
      setError(errorMessage(err));
      void shake.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } });
      setPending(null);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      void shake.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } });
      return;
    }
    void signIn({ email, password }, "form");
  }

  function useDemo() {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    void signIn(DEMO_CREDENTIALS, "demo");
  }

  const busy = pending !== null;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex h-full flex-col justify-between">
      <div>
        <motion.div variants={rise} className="mb-10">
          <h1 className="text-[23px] leading-8 font-semibold tracking-[-0.01em] text-ink">Log in to Medslot</h1>
          <p className="mt-1.5 text-[15px] leading-6 text-muted">Staff access to the clinic appointment desk.</p>
        </motion.div>

        <motion.form animate={shake} onSubmit={onSubmit} noValidate>
          <motion.div variants={rise} className="flex flex-col gap-2 pb-4">
            <label htmlFor="login_email" className="self-start text-base leading-6 tracking-[-0.01em]">
              Email *
            </label>
            <div className={FIELD}>
              <input
                id="login_email"
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={error ? true : undefined}
                className={INPUT}
              />
            </div>
          </motion.div>

          <motion.div variants={rise} className="flex flex-col gap-2 pb-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="login_password" className="self-start text-base leading-6 tracking-[-0.01em]">
                Password *
              </label>
              <div className={FIELD}>
                <input
                  id="login_password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={error ? true : undefined}
                  className={INPUT}
                />
              </div>
            </div>
            <span className="self-start text-sm leading-5 tracking-[-0.01em] text-muted">
              Forgot it? Ask your clinic admin.
            </span>
          </motion.div>

          <AnimatePresence initial={false}>
            {error && (
              <motion.p
                key="error"
                role="alert"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden rounded-lg bg-red-50 px-4 py-3 text-sm leading-5 text-red-700 ring-1 ring-red-100"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.div variants={rise}>
            <motion.button
              type="submit"
              disabled={busy}
              whileTap={busy ? undefined : { scale: 0.985 }}
              className={clsx(BUTTON_BASE, BUTTON_PRIMARY)}
            >
              {pending === "form" && <Spinner />}
              {pending === "form" ? "Logging in…" : "Log in"}
            </motion.button>
          </motion.div>
        </motion.form>

        <motion.div variants={rise} className="my-4 flex items-center">
          <span className="h-px flex-1 bg-zinc-300" />
          <span className="mx-4 text-[13px] leading-[1.5] text-ink">OR</span>
          <span className="h-px flex-1 bg-zinc-300" />
        </motion.div>

        <motion.div variants={rise}>
          <motion.button
            type="button"
            onClick={useDemo}
            disabled={busy}
            whileTap={busy ? undefined : { scale: 0.985 }}
            className={clsx(BUTTON_BASE, BUTTON_SECONDARY)}
          >
            {pending === "demo" ? <Spinner /> : <SparkIcon />}
            Continue with demo account
          </motion.button>
        </motion.div>

        <motion.div variants={rise} className="mt-4">
          <a
            href={`${API_BASE_URL.replace(/\/api\/?$/, "")}/api/docs/`}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(BUTTON_BASE, BUTTON_SECONDARY)}
          >
            <DocsIcon />
            Explore the API (Swagger)
          </a>
        </motion.div>
      </div>

      <motion.p variants={rise} className="pt-10 pb-12 text-base leading-6 tracking-[-0.01em] text-muted">
        Demo login: <span className="font-medium text-ink">{DEMO_CREDENTIALS.email}</span> /{" "}
        <span className="font-medium text-ink">{DEMO_CREDENTIALS.password}</span>
      </motion.p>
    </motion.div>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.5 2.5M15.2 15.2l2.5 2.5M6.3 17.7l2.5-2.5M15.2 8.8l2.5-2.5" strokeLinecap="round" />
    </svg>
  );
}

function DocsIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13.5 6l-3 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
