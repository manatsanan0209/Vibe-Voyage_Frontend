import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Vibe Voyage</h1>
        <p className="mt-2 text-sm text-white/70">
          Starter template with Tailwind + React Router
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/signin"
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white/90"
          >
            Go to Sign In
          </Link>
          <Link
            to="/signup"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
          >
            Go to Sign Up
          </Link>
          <a
            href="https://reactrouter.com/en/main"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
          >
            React Router Docs
          </a>
        </div>
      </div>
    </div>
  )
}
