import { useState, type FormEvent } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { JoinTripByInviteCodeDataDTO } from '@/services/trip.service';
import { useJoinTripByInviteCode } from '@/hooks/useJoinTripByInviteCode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import inviteCodeIcon from '@/assets/createTrip/invite_code.png';

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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-start">
                <button
                    type="button"
                    onClick={onBack}
                    aria-label="Back"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="size-4" />
                </button>
            </div>

            <div className="space-y-4">
                <p className="text-center text-base font-semibold text-foreground">
                    Enter the invitation code
                </p>

                <div className="relative max-w-34 mx-auto">
                    <img
                        src={inviteCodeIcon}
                        alt="Invite code"
                        className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 opacity-70"
                    />
                    <Input
                        id="invite-code"
                        value={inviteCode}
                        onChange={(event) => setInviteCode(event.target.value)}
                        placeholder="Invitation Code"
                        autoComplete="off"
                        className="h-8 border-border bg-background pl-7 text-[11px] tracking-normal text-center placeholder:text-muted-foreground"
                    />
                </div>
            </div>

            {error && (
                <p className="text-center text-sm text-destructive">{error}</p>
            )}

            <div className="flex justify-center">
                <Button
                    type="submit"
                    className="h-8 min-w-17 rounded-md px-7 text-xs font-semibold"
                    disabled={isLoading}
                >
                    {isLoading ? 'Joining...' : 'Join'}
                </Button>
            </div>
        </form>
    );
}
