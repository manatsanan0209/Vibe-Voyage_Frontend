import { useState, type FormEvent } from 'react';
import type { JoinTripByInviteCodeDataDTO } from '@/services/trip.service';
import { useJoinTripByInviteCode } from '@/hooks/useJoinTripByInviteCode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface JoinRoomProps {
    onBack: () => void;
    onSuccess: (data: JoinTripByInviteCodeDataDTO) => void;
}

export default function JoinRoom({ onBack, onSuccess }: JoinRoomProps) {
    const [inviteCode, setInviteCode] = useState('');
    const { isLoading, error, submit } = useJoinTripByInviteCode();

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            const data = await submit(inviteCode);
            onSuccess(data);
        } catch {
            // Error state is already mapped inside useJoinTripByInviteCode.
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <button
                type="button"
                onClick={onBack}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
                Back
            </button>

            <div className="space-y-1.5">
                <label
                    htmlFor="invite-code"
                    className="text-sm font-semibold text-indigo-900"
                >
                    Invitation Code
                </label>
                <Input
                    id="invite-code"
                    value={inviteCode}
                    onChange={(event) => setInviteCode(event.target.value)}
                    placeholder="Enter the invitation code"
                    autoComplete="off"
                    className="uppercase tracking-[0.2em]"
                />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={isLoading}
            >
                {isLoading ? 'Joining...' : 'Join'}
            </Button>
        </form>
    );
}
