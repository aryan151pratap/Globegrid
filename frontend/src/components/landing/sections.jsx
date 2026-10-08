import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ROUTES, FEATURES, DEVICES, STEPS, HERO_IMAGE, FIRMWARE_SNIPPET,
} from "./Landingdata";

const btnLight = "inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-200";
const btnOutline = "inline-block rounded-xl border border-white px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10";
const chip = "mb-3.5 inline-block rounded-full bg-neutral-100 px-3.5 py-1.5 text-xs font-semibold";

// Shows a plain panel if the image URL fails
function Img({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`grid place-items-center bg-neutral-100 font-semibold text-neutral-500 ${className}`}>
        {alt}
      </div>
    );
  }
  return (
    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)}
         className={`object-cover ${className}`} />
  );
}

export function Hero({ user }) {
  return (
    <section className="relative min-h-[560px] overflow-hidden rounded-3xl bg-neutral-800">
      <Img src={HERO_IMAGE} alt="MicroPython IoT board"
           className="absolute inset-0 h-full w-full grayscale contrast-105" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/10" />
      <div className="relative max-w-[640px] px-6 pb-14 pt-32 text-white md:px-12 md:pt-44">
        <h1 className="text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
          Manage Every Device<br />From Anywhere.<br />No Site Visits.
        </h1>
        <p className="my-6 leading-relaxed text-neutral-300">
          Edit files, run scripts, restart and watch live sensor data on your
          remote MicroPython boards, all from one dashboard.
        </p>
        <div className="flex flex-wrap gap-3">
          {user ? (
            <Link to="/dashboard" className={btnLight}>Open dashboard</Link>
          ) : (
            <>
              <Link to="/login" className={btnLight}>Get started</Link>
              <Link to="/login" className={btnOutline}>Login</Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section className="flex flex-col gap-2 px-2 pt-16 md:flex-row md:gap-12 md:px-10 md:pt-20">
      <div><span className={chip}>About</span></div>
      <p className="max-w-[820px] text-xl leading-snug md:text-[28px]">
        Globgrid is a web platform for remotely managing and monitoring
        MicroPython devices like the ESP32. Each device connects to a FastAPI
        backend over WebSocket, and a React dashboard lets you browse and edit
        files, run scripts, restart the board and view live sensor data, so you
        never have to physically go to a deployed device again.
      </p>
    </section>
  );
}

export function Features() {
  return (
    <section id="features" className="px-2 pt-20">
      <h2 className="mb-7 text-3xl font-bold tracking-tight md:text-4xl">
        Everything you need to run a fleet
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <article key={f.title} className="rounded-3xl bg-neutral-100 p-6">
            <span className={`${chip} bg-white`}>{f.tag}</span>
            <h3 className="mb-2 text-lg font-bold">{f.title}</h3>
            <p className="leading-relaxed text-neutral-500">{f.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Devices() {
  return (
    <section id="devices" className="px-2 pt-20">
      <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
        Supported MicroPython hardware
      </h2>
      <p className="mb-8 text-neutral-500">
        Anything that runs MicroPython and has network access can join your grid.
      </p>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {DEVICES.map((d) => (
          <article key={d.name} className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
            <Img src={d.image} alt={d.name} className="block h-56 w-full bg-neutral-100" />
            <div className="p-5">
              <h3 className="text-xl font-bold">{d.name}</h3>
              <small className="text-neutral-500">{d.chip}</small>
              <p className="mt-3 leading-relaxed text-neutral-500">{d.text}</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                {d.specs.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section id="how" className="px-2 pt-20">
      <h2 className="mb-7 text-3xl font-bold tracking-tight md:text-4xl">How it works</h2>
      <div className="grid items-start gap-8 md:grid-cols-2">
        <ol className="grid gap-6">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-4">
              <span className="text-xl font-extrabold text-neutral-400">{s.n}</span>
              <div>
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="mt-1.5 leading-relaxed text-neutral-500">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <pre className="overflow-auto rounded-3xl bg-neutral-900 p-6 text-[13px] leading-relaxed text-neutral-200">
          <code>{FIRMWARE_SNIPPET}</code>
        </pre>
      </div>
    </section>
  );
}

export function QuickLinks() {
  return (
    <section className="px-2 pt-20">
      <h2 className="mb-5 text-3xl font-bold tracking-tight md:text-4xl">Jump into the app</h2>
      <div className="flex flex-wrap gap-3">
        {ROUTES.map((r) => (
          <Link key={r.to} to={r.to}
                className="rounded-2xl bg-neutral-100 px-6 py-4 font-semibold transition hover:bg-neutral-900 hover:text-white">
            {r.label} →
          </Link>
        ))}
      </div>
    </section>
  );
}

export function AuthCta() {
  return (
    <section className="mt-20 rounded-3xl bg-neutral-900 px-6 py-16 text-center text-white md:px-10">
      <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
        Start managing your devices remotely
      </h2>
      <p className="mb-6 text-neutral-300">
        Create a free account, connect your first ESP32 and see it live in minutes.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/signup" className={btnLight}>Sign up</Link>
        <Link to="/login" className={btnOutline}>Login</Link>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="flex flex-wrap justify-between gap-2 px-2 py-12 text-sm text-neutral-500">
      <strong className="text-neutral-900">GLOBGRID</strong>
      <span>MicroPython · FastAPI · React · WebSocket</span>
    </footer>
  );
}