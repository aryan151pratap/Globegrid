import useAuth from "./Useauth";
import Navbar from "./navBar";
import {
  Hero, About, Features, Devices, HowItWorks, QuickLinks, AuthCta, Footer,
} from "./sections";

export default function Landing() {
  // getUser() runs on mount inside useAuth: GET /auth/me with the cookie.
  // user === null  -> show Login / Sign up
  // user !== null  -> show app routes
  const { user, loading, logout } = useAuth();

  return (
    <div className="mx-auto max-w-[1250px] px-4 pt-3 font-sans text-neutral-900">
      <div className="relative">
        <Navbar user={user} loading={loading} onLogout={logout} />
        <Hero user={user} />
      </div>
      <About />
      <Features />
      <Devices />
      <HowItWorks />
      {!loading && (user ? <QuickLinks /> : <AuthCta />)}
      <Footer />
    </div>
  );
}