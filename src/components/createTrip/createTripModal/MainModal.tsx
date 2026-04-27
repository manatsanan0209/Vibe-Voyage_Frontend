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
            <DialogContent
                className={`${mode === 'choice'
                        ? 'sm:max-w-md'
                        : 'sm:max-w-88 px-4 py-5 [&>button]:text-accent-foreground'
                    }`}
            >
                {mode === 'choice' && (
                    <DialogHeader>
                        <DialogTitle>Start your next trip</DialogTitle>
                        <DialogDescription>
                            Choose how you want to continue.
                        </DialogDescription>
                    </DialogHeader>
                )}

                {mode === 'choice' ? (
                    <div className="flex flex-col gap-4 my-3">
                        <Button
                            type="button"
                            className="bg-primary hover:bg-primary/90 mx-3"
                            onClick={handleCreate}
                        >
                            Create
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="border-border text-primary hover:bg-muted mx-3"
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
