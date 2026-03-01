import logo from '@/assets/Vibe-voyage-Logo.png';
import icon from '@/assets/icon.png';

export default function NavLogo() {
    return (
        <div className="flex items-center px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <img
                src={logo}
                alt="Vibe Voyage Logo"
                className="w-32 group-data-[collapsible=icon]:hidden"
            />
            <img
                src={icon}
                alt="Vibe Voyage"
                className="hidden size-14 mt-8 mb-8 group-data-[collapsible=icon]:block"
            />
        </div>
    );
}
