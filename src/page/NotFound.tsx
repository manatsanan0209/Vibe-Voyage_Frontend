import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="mx-auto w-full max-w-5xl px-6 py-10">
            <div className="rounded-2xl border border-border bg-card p-6">
                <h1 className="text-xl font-semibold">Page not found</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    The page you requested doesn’t exist.
                </p>
                <Link
                    to="/"
                    className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
