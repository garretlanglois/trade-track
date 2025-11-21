import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  const session = await getSession();

  if (session?.email) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-semibold text-white">TradeTrack</h1>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/auth/signin"
              className="rounded-full px-4 py-2 border border-slate-700 font-medium text-white hover:bg-slate-800 transition"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1">
        {/* HERO */}
        <section
          className="relative w-full overflow-hidden border border-slate-800 bg-slate-900/70 px-6 py-32 text-center"
          style={{
            backgroundImage:
              "url('https://www.rantsports.com/wp-content/uploads/2025/02/image6-1.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-slate-950/70" aria-hidden />
          <div className="relative z-10 mx-auto max-w-5xl">
            <h2 className="text-5xl font-bold tracking-tight text-white">
              Streamlined Draft & Trade Management
            </h2>
            <p className="mt-5 text-lg text-slate-200 max-w-2xl mx-auto">
              TradeTrack helps leagues manage picks, approvals, and transactions
              in one calm, efficient workspace. No clutter. No confusion.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/signin"
                className="rounded-full bg-sky-500 px-6 py-3 font-semibold text-slate-950 hover:bg-sky-400 transition"
              >
                Enter Dashboard
              </Link>
              <Link
                href="/auth/signin"
                className="rounded-full border border-slate-200/70 px-6 py-3 font-semibold text-white hover:bg-white/10 transition"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mx-auto max-w-6xl px-6 py-20 space-y-12">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-3xl font-semibold text-white">
              Built for Clarity and Control
            </h3>
            <p className="mt-3 text-slate-400">
              Every feature is designed to keep managers informed and confident.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
              <h4 className="text-lg font-semibold text-white mb-2">
                Centralized Draft Oversight
              </h4>
              <p className="text-slate-400 text-sm">
                Track picks, approvals, and deadlines with transparent updates
                for all managers.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
              <h4 className="text-lg font-semibold text-white mb-2">
                Secure Team Access
              </h4>
              <p className="text-slate-400 text-sm">
                Session-driven permissions ensure only verified members can
                manage league activity.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
              <h4 className="text-lg font-semibold text-white mb-2">
                Insightful Analytics
              </h4>
              <p className="text-slate-400 text-sm">
                Overview screens highlight trends, trade velocity, and key
                decisions over time.
              </p>
            </div>
          </div>
        </section>

        {/* IMAGE SHOWCASE */}
        <section className="bg-slate-900/70 border-t border-b border-slate-800">
          <div className="mx-auto max-w-6xl px-6 py-20 grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <h3 className="text-3xl font-semibold text-white">
                Designed for Professional Leagues
              </h3>
              <p className="mt-4 text-slate-400">
                The interface applies restrained use of color and typography,
                focusing attention on live trades and collaboration.
              </p>
              <ul className="mt-6 space-y-3 text-slate-300 text-sm">
                <li>• Minimal noise, clear status indicators.</li>
                <li>• Configurable team roles and activity feeds.</li>
                <li>• Optimized for desktop and mobile dashboards.</li>
              </ul>
            </div>
            <Image
              src="/ice-rink.svg"
              alt="League dashboard illustration"
              width={500}
              height={350}
              className="rounded-xl border border-slate-800 bg-slate-950/60"
            />
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl text-center px-6 py-20">
          <h3 className="text-3xl font-semibold text-white">
            Ready to elevate your league?
          </h3>
          <p className="mt-3 text-slate-400">
            Create structure, simplify decisions, and keep every manager on the
            same page.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/auth/signin"
              className="rounded-full bg-sky-500 px-8 py-3 font-semibold text-slate-950 hover:bg-sky-400 transition"
            >
              Get Started
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs uppercase tracking-[0.3em] text-slate-500">
        © {new Date().getFullYear()} TradeTrack • League‑Ready Systems
      </footer>
    </div>
  );
}