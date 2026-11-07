import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";
import { LoginForm } from "@/components/login/LoginForm";
import { LoginShowcase } from "@/components/login/LoginShowcase";

export const metadata: Metadata = { title: "Log in · Medslot" };

/* Split layout from Maze's login: fixed 560px white form column (full width under 1024px), showcase fills the rest. */
export default function LoginPage() {
  return (
    <main className="flex h-dvh w-full">
      <section className="flex w-full shrink-0 flex-col overflow-x-hidden overflow-y-auto bg-white lg:w-[560px]">
        <div className="px-10 pt-8 pb-8">
          <Logo />
        </div>
        <div className="flex-1 px-10">
          <LoginForm />
        </div>
      </section>
      <LoginShowcase />
    </main>
  );
}
