import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';

export default function TopHeader() {
    const { isAuthenticated, user } = useAuth();

    return (
        <header className="flex h-24 items-center justify-between px-8">
            <SidebarTrigger className="md:hidden" />
            <div className="ml-auto flex items-center gap-4">
                {isAuthenticated ? (
                    <>
                        <div className="size-[38px] rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                            <User className="size-5 text-gray-500" />
                        </div>
                        <span className="font-extrabold text-[15px] text-[#523fff]">
                            Hi, {user?.username}
                        </span>
                    </>
                ) : (
                    <>
                        <Link
                            to="/signup"
                            className="flex items-center justify-center w-[98px] h-[33px] rounded-[7px] border border-[#d5d5d5] font-extrabold text-[15px] text-[#523fff] shadow-[0px_4px_4px_0px_rgba(93,93,93,0.18)] transition-all duration-200 hover:rounded-[20px] hover:shadow-none hover:bg-[#523fff]/10"
                        >
                            Sign up
                        </Link>
                        <Link
                            to="/signin"
                            className="flex items-center justify-center w-[98px] h-[33px] rounded-[7px] bg-[#523fff] font-extrabold text-[15px] text-white shadow-[0px_4px_4px_0px_rgba(93,93,93,0.25)] transition-all duration-200 hover:rounded-[20px] hover:bg-[#4230e0] hover:shadow-none"
                        >
                            Sign in
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}
