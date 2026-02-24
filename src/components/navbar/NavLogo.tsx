import logo from '@/assets/Vibe-voyage-Logo.png';

export default function NavLogo() {
    return (
        <div className="flex items-center gap-3 px-4">
            <img src={logo} alt="Vibe Voyage Logo" className="w-32" />
        </div>
    );
}
