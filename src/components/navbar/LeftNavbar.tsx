import NavItem from './NavItem';
import NavLogo from './NavLogo';
import NavLogout from './NavLogout';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/hooks/useI18n';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
} from '@/components/ui/sidebar';
import homeIcon from '@/assets/leftnavbar/home-icon.png';
import homeIconFocus from '@/assets/leftnavbar/home-icon-focus.png';
import yourTripsIcon from '@/assets/leftnavbar/your-trips-icon.png';
import yourTripIconFocus from '@/assets/leftnavbar/your-trip-icon-focus.png';
import tripSuggestIcon from '@/assets/leftnavbar/trip-suggest-icon.png';
import tripSuggestIconFocus from '@/assets/leftnavbar/trip-suggest-icon-focus.png';
import aboutUsIcon from '@/assets/leftnavbar/about-us-icon.png';
import aboutUsIconFocus from '@/assets/leftnavbar/about-us-icon-focus.png';
import settingIcon from '@/assets/leftnavbar/setting-icon.png';
import settingIconFocus from '@/assets/leftnavbar/setting-icon-focus.png';

export default function LeftNavbar() {
    const { isAuthenticated } = useAuth();
    const { t } = useI18n();

    const baseNavItems = [
        {
            icon: homeIcon,
            iconFocus: homeIconFocus,
            label: t('nav.home'),
            to: '/',
        },
        {
            icon: tripSuggestIcon,
            iconFocus: tripSuggestIconFocus,
            label: t('nav.tripSuggestions'),
            to: '/trips',
        },
        {
            icon: aboutUsIcon,
            iconFocus: aboutUsIconFocus,
            label: t('nav.aboutUs'),
            to: '/about',
        },
        {
            icon: settingIcon,
            iconFocus: settingIconFocus,
            label: t('nav.settings'),
            to: '/settings',
        },
    ];

    const yourTripsItem = {
        icon: yourTripsIcon,
        iconFocus: yourTripIconFocus,
        label: t('nav.yourTrips'),
        to: '/your-trips',
    };

    const navItems = isAuthenticated
        ? [baseNavItems[0], yourTripsItem, ...baseNavItems.slice(1)]
        : baseNavItems;

    return (
        <Sidebar className="shadow-xl" collapsible="icon">
            <SidebarHeader className="pt-5 pb-0">
                <NavLogo />
            </SidebarHeader>

            <SidebarContent className="mt-6 px-4 group-data-[collapsible=icon]:mt-4 group-data-[collapsible=icon]:px-2">
                <SidebarMenu className="gap-8">
                    {navItems.map((item) => (
                        <NavItem key={item.to} {...item} />
                    ))}
                </SidebarMenu>
            </SidebarContent>

            {isAuthenticated && (
                <SidebarFooter className="px-4 pb-6">
                    <SidebarMenu>
                        <NavLogout />
                    </SidebarMenu>
                </SidebarFooter>
            )}
        </Sidebar>
    );
}
