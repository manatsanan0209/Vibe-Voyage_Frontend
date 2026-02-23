import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
    const { isAuthenticated, logout } = useAuth();

    return (
        <div className="mx-auto w-full max-w-5xl px-6 py-10">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Vibe Voyage
                </h1>
                <p className="mt-2 text-sm text-white/70">
                    Starter template with Tailwind + React Router
                </p>

                {isAuthenticated ? (
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        <span>You are signed in!</span>
                        <Button variant="outline" onClick={logout}>
                            Sign Out
                        </Button>
                    </div>
                ) : (
                    <div className="mt-5 flex flex-wrap gap-3">
                        <Button>
                            <Link to="/signin">Go to Sign In</Link>
                        </Button>

                        <Button>
                            <Link to="/signup">Go to Sign Up</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
