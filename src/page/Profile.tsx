import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/hooks/useI18n';

export default function Profile() {
    const { user, logout } = useAuth();
    const { t } = useI18n();

    return (
        <div className="mx-auto w-full max-w-5xl px-6 py-10">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {t('profile.title')}
                </h1>
                <p className="mt-2 text-sm text-white/70">
                    {t('profile.welcome')}, {user?.username ?? t('common.user')}
                </p>
                <div className="mt-5">
                    <Button variant="outline" onClick={logout}>
                        {t('profile.signOut')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
