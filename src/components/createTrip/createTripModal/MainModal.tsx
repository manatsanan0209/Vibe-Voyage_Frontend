import { useState } from 'react';
import JoinRoom from './JoinRoom';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { JoinTripByInviteCodeDataDTO } from '@/services/trip.service';

type ModalMode = 'choice' | 'join';

interface MainModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreate: () => void;
    onJoinSuccess: (data: JoinTripByInviteCodeDataDTO) => void;
}

export default function MainModal({
    open,
    onOpenChange,
    onCreate,
    onJoinSuccess,
}: MainModalProps) {
    const [mode, setMode] = useState<ModalMode>('choice');

    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen) {
            setMode('choice');
        }
        onOpenChange(nextOpen);
    }

    function handleCreate() {
        onOpenChange(false);
        onCreate();
    }

    function handleJoinSuccess(data: JoinTripByInviteCodeDataDTO) {
        onOpenChange(false);
        onJoinSuccess(data);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'choice'
                            ? 'Start your next trip'
                            : 'Join trip by invite code'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'choice'
                            ? 'Choose how you want to continue.'
                            : 'Enter the invitation code to join this trip.'}
                    </DialogDescription>
                </DialogHeader>

                {mode === 'choice' ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Button
                            type="button"
                            className="h-24 bg-indigo-600 hover:bg-indigo-700"
                            onClick={handleCreate}
                        >
                            Create
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-24 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                            onClick={() => setMode('join')}
                        >
                            Join
                        </Button>
                    </div>
                ) : (
                    <JoinRoom
                        onBack={() => setMode('choice')}
                        onSuccess={handleJoinSuccess}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
