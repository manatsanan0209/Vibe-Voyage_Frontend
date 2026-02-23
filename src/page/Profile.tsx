import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function Profile() {
    const { user, logout } = useAuth();

    return (
        <div className="mx-auto w-full max-w-5xl px-6 py-10">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Profile
                </h1>
                <p className="mt-2 text-sm text-white/70">
                    Welcome, {user?.username ?? 'User'}
                </p>
                <div className="mt-5">
                    <Button variant="outline" onClick={logout}>
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
}
