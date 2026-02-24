import { Outlet } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import TopHeader from '@/components/layout/TopHeader';
import LeftNavbar from '@/components/navbar/LeftNavbar';

export default function MainLayout() {
    return (
        <SidebarProvider
            style={{ '--sidebar-width': '14.1875rem' } as React.CSSProperties}
        >
            <LeftNavbar />
            <SidebarInset>
                <TopHeader />
                <Outlet />
            </SidebarInset>
        </SidebarProvider>
    );
}
