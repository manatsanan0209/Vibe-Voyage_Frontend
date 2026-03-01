import { useNavigate } from 'react-router-dom';

export default function NewTripCard() {
    const navigate = useNavigate();

    return (
        <button
            type="button"
            onClick={() => navigate('/create-trip')}
            className="w-full aspect-183/130 rounded-2xl bg-indigo-400 border-2 border-indigo-400 flex flex-col items-center justify-center text-white font-bold text-xl leading-snug hover:opacity-90 transition-opacity cursor-pointer shrink-0"
        >
            <span>+</span>
            <span>New Trip</span>
        </button>
    );
}
