import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

export default function NavLogout() {
    const { logout } = useAuth();

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                onClick={logout}
                className="h-10.75 rounded-none px-6 font-bold text-sm text-red-500 transition-all duration-200 hover:rounded-4xl hover:bg-red-50 hover:text-red-500"
            >
                <LogOut className="size-5 shrink-0" />
                <span>Logout</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
