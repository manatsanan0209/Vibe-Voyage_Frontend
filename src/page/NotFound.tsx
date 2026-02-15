import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-white/70">The page you requested doesn’t exist.</p>
        <Link
          to="/"
          className="mt-5 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white/90"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
