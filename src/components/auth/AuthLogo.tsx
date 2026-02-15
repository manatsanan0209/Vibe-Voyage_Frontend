import logo from "../../assets/Vibe-voyage-Logo.png";

export default function AuthLogo() {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <img className="w-1/5" src={logo} alt="Vibe Voyage Logo" />
      <p className="text-lg font-bold text-indigo-900">Welcome to Vibe Voyage</p>
      <p className="text-sm font-light text-indigo-900">
        Turn your <span className="font-light text-pink-500">vibe</span> into
        unforgettable adventures.
      </p>
    </div>
  );
}
