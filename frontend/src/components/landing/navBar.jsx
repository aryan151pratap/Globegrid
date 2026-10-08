import { Link, NavLink } from "react-router-dom";
import { ROUTES } from "./Landingdata";

const linkCls = ({ isActive }) =>
  `transition hover:text-black ${isActive ? "font-bold text-black" : "text-neutral-600"}`;

/**
 * Logged in  -> app routes + Logout
 * Logged out -> Login / Sign up
 */
export default function Navbar({ user, loading, onLogout }) {
  return (
    <header className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-[1200px] items-center justify-between px-4 py-5 md:px-9">
      <Link to="/" className="text-2xl font-extrabold tracking-wide text-white">
        GLOBGRID
      </Link>

      <nav className="absolute left-1/2 top-0 hidden -translate-x-1/2 gap-5 rounded-b-3xl bg-white px-7 py-3 text-[13px] md:flex">
        <NavLink to="/" end className={linkCls}>Home</NavLink>
        {!loading && user &&
          ROUTES.map((r) => (
            <NavLink key={r.to} to={r.to} className={linkCls}>{r.label}</NavLink>
          ))}
        {!user && <a href="#features" className="text-neutral-600 hover:text-black">Features</a>}
        {!user && <a href="#devices" className="text-neutral-600 hover:text-black">Devices</a>}
        {!user && <a href="#how" className="text-neutral-600 hover:text-black">How it works</a>}
      </nav>

      <div className="flex items-center gap-2 text-white">
        {loading ? (
          <span className="text-sm text-neutral-300">Checking session…</span>
        ) : user ? (
          <>
            <span className="hidden px-2 text-sm text-neutral-300 sm:inline">
              {user.name || user.email}
            </span>
            <button
              onClick={onLogout}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-200"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="rounded-xl px-4 py-2.5 text-sm hover:bg-white/10">Login</Link>
            <Link to="/login" className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-200">
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}