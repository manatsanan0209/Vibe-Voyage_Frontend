import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function TopHeader() {
    const { isAuthenticated, user } = useAuth();

    return (
        <header className="flex h-24 items-center justify-between px-8">
            <SidebarTrigger className="md:hidden" />
            <div className="ml-auto flex items-center gap-4">
                {isAuthenticated ? (
                    <>
                        <div className="size-9.5 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                            <User className="size-5 text-gray-500" />
                        </div>
                        <span className="font-extrabold text-sm text-indigo-600">
                            Hi, {user?.username}
                        </span>
                    </>
                ) : (
                    <>
                        <Button
                            asChild
                            variant="outline"
                            className="w-24.5 h-8.25 rounded-lg border-gray-300 font-extrabold text-sm text-indigo-600 shadow-[0px_4px_4px_0px_rgba(93,93,93,0.18)] hover:rounded-4xl hover:shadow-none hover:bg-indigo-600/10 hover:text-indigo-600"
                        >
                            <Link to="/signup">Sign up</Link>
                        </Button>
                        <Button
                            asChild
                            className="w-24.5 h-8.25 rounded-lg bg-indigo-600 font-extrabold text-sm text-white shadow-[0px_4px_4px_0px_rgba(93,93,93,0.25)] hover:rounded-4xl hover:bg-indigo-700 hover:shadow-none"
                        >
                            <Link to="/signin">Sign in</Link>
                        </Button>
                    </>
                )}
            </div>
        </header>
    );
}
