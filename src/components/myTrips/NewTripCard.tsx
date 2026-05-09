import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { JoinTripByInviteCodeDataDTO } from '@/services/trip.service';
import MainModal from '@/components/createTrip/createTripModal/MainModal';

export default function NewTripCard() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    function handleCreate() {
        navigate('/create-trip');
    }

    function handleJoinSuccess(data: JoinTripByInviteCodeDataDTO) {
        if (data.role === 2) {
            navigate(`/your-trips/${data.trip_id}/lifestyle`, {
                state: {
                    roomId: String(data.room_id),
                    joinedRole: data.role,
                    fromJoin: true,
                },
            });
            return;
        }

        navigate(`/your-trips/${data.trip_id}`, {
            state: {
                joinedRole: data.role,
            },
        });
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="aspect-183/130 w-full shrink-0 cursor-pointer rounded-2xl border-2 border-primary bg-primary text-base font-bold leading-snug text-primary-foreground transition-colors hover:bg-primary/90 sm:text-xl flex flex-col items-center justify-center"
            >
                <span>+</span>
                <span>New Trip</span>
            </button>

            <MainModal
                open={open}
                onOpenChange={setOpen}
                onCreate={handleCreate}
                onJoinSuccess={handleJoinSuccess}
            />
        </>
    );
}
