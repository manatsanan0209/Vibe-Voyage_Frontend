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
        <header className="flex h-20 items-center justify-between px-4 sm:h-24 sm:px-8">
            <SidebarTrigger className="md:hidden" />
            <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-4">
                {isAuthenticated ? (
                    <Link
                        to="/profile"
                        className="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-75 sm:gap-4"
                    >
                        <div className="size-9.5 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                            <User className="size-5 text-gray-500" />
                        </div>
                        <span className="truncate text-sm font-extrabold text-primary">
                            {t('auth.hi')}, {user?.username}
                        </span>
                    </Link>
                ) : (
                    <>
                        <Button
                            asChild
                            variant="outline"
                            className="h-8.25 w-20 rounded-lg border-gray-300 text-xs font-extrabold text-primary shadow-[0px_4px_4px_0px_rgba(93,93,93,0.18)] hover:rounded-4xl hover:bg-primary/10 hover:text-primary hover:shadow-none sm:w-24.5 sm:text-sm"
                        >
                            <Link to="/signup">{t('auth.signUp')}</Link>
                        </Button>
                        <Button
                            asChild
                            className="h-8.25 w-20 rounded-lg bg-primary text-xs font-extrabold text-primary-foreground shadow-[0px_4px_4px_0px_rgba(93,93,93,0.25)] hover:rounded-4xl hover:bg-primary/90 hover:shadow-none sm:w-24.5 sm:text-sm"
                        >
                            <Link to="/signin">{t('auth.signIn')}</Link>
                        </Button>
                    </>
                )}
            </div>
        </header>
    );
}
