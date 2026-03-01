import { Link, useLocation } from 'react-router-dom';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

interface NavItemProps {
    icon: string;
    iconFocus: string;
    label: string;
    to: string;
}

export default function NavItem({ icon, iconFocus, label, to }: NavItemProps) {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={isActive}
                className="h-10.75 rounded-none px-6 font-bold text-sm transition-all duration-200 hover:rounded-4xl data-[active=true]:rounded-4xl data-[active=true]:bg-indigo-900! data-[active=true]:text-white! data-[active=true]:shadow-[0px_4px_5px_0px_rgba(76,61,121,0.3)]"
            >
                <Link to={to}>
                    <img
                        src={isActive ? iconFocus : icon}
                        alt={label}
                        className="size-5 shrink-0"
                    />
                    <span className="text-md">{label}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
