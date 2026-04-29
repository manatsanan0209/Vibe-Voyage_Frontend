import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/hooks/useI18n';

export default function TopHeader() {
    const { isAuthenticated, user } = useAuth();
    const { t } = useI18n();

    return (
        <header className="flex h-24 items-center justify-between px-8">
            <SidebarTrigger className="md:hidden" />
            <div className="ml-auto flex items-center gap-4">
                {isAuthenticated ? (
                    <Link
                        to="/profile"
                        className="flex items-center gap-4 hover:opacity-75 transition-opacity"
                    >
                        <div className="size-9.5 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                            <User className="size-5 text-gray-500" />
                        </div>
                        <span className="font-extrabold text-sm text-primary">
                            {t('auth.hi')}, {user?.username}
                        </span>
                    </Link>
                ) : (
                    <>
                        <Button
                            asChild
                            variant="outline"
                            className="w-24.5 h-8.25 rounded-lg border-gray-300 font-extrabold text-sm text-primary shadow-[0px_4px_4px_0px_rgba(93,93,93,0.18)] hover:rounded-4xl hover:shadow-none hover:bg-primary/10 hover:text-primary"
                        >
                            <Link to="/signup">{t('auth.signUp')}</Link>
                        </Button>
                        <Button
                            asChild
                            className="w-24.5 h-8.25 rounded-lg bg-primary font-extrabold text-sm text-primary-foreground shadow-[0px_4px_4px_0px_rgba(93,93,93,0.25)] hover:rounded-4xl hover:bg-primary/90 hover:shadow-none"
                        >
                            <Link to="/signin">{t('auth.signIn')}</Link>
                        </Button>
                    </>
                )}
            </div>
        </header>
    );
}
