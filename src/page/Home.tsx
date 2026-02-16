import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Home() {
    const [isSign, setIsSign] = useState(() => {
        const token = localStorage.getItem('token');
        const expiresAt = localStorage.getItem('expires_at');

        if (!token || !expiresAt) return false;

        const expiresMs = new Date(expiresAt).getTime();
        return Date.now() < expiresMs;
    });

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('expires_at');
        localStorage.removeItem('user_id');
        localStorage.removeItem('username');
        localStorage.removeItem('remember_me');
        setIsSign(false);
    };

    return (
        <div className="mx-auto w-full max-w-5xl px-6 py-10">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Vibe Voyage
                </h1>
                <p className="mt-2 text-sm text-white/70">
                    Starter template with Tailwind + React Router
                </p>

                {isSign ? (
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        <span>You are signed in!</span>
                        <Button variant="outline" onClick={handleSignOut}>
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
