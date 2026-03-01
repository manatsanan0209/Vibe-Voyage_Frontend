import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

export default function NavLogout() {
    const { logout } = useAuth();

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                onClick={logout}
                className="h-10.75 rounded-none px-6 font-bold text-sm text-[#f6373a] transition-all duration-200 hover:rounded-[20px] hover:bg-red-50 hover:text-[#f6373a] group-data-[collapsible=icon]:h-10.75! group-data-[collapsible=icon]:w-full! group-data-[collapsible=icon]:px-0! group-data-[collapsible=icon]:justify-center!"
            >
                <LogOut className="size-5 shrink-0 group-data-[collapsible=icon]:size-6" />
                <span className="group-data-[collapsible=icon]:hidden">
                    Logout
                </span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
