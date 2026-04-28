import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { suggestionService } from '@/services/suggestion.service';
import { useI18n } from '@/hooks/useI18n';

interface UseAsTemplateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    publishedTripId: number;
    destinationName: string;
    originalDays: number;
}

export default function UseAsTemplateDialog({
    open,
    onOpenChange,
    publishedTripId,
    destinationName,
    originalDays,
}: UseAsTemplateDialogProps) {
    const { t } = useI18n();
    const navigate = useNavigate();
    const [roomName, setRoomName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function resetForm() {
        setRoomName('');
        setStartDate('');
        setEndDate('');
        setError(null);
        setSubmitting(false);
    }

    function handleOpenChange(val: boolean) {
        if (!val) resetForm();
        onOpenChange(val);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!roomName.trim() || !startDate || !endDate) return;

        setSubmitting(true);
        setError(null);

        try {
            const result = await suggestionService.useAsTemplate(
                publishedTripId,
                {
                    room_name: roomName.trim(),
                    start_date: startDate,
                    end_date: endDate,
                },
            );
            onOpenChange(false);
            resetForm();
            navigate(`/your-trips/${result.trip_id}`, {
                state: { fromCreateTrip: true, createdAt: Date.now() },
            });
        } catch {
            setError('Failed to create trip. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    const today = new Date().toISOString().split('T')[0];

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {t('tripSuggestions.templateDialog.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('tripSuggestions.templateDialog.description')}{' '}
                        <span className="font-medium text-foreground">
                            {destinationName}
                        </span>{' '}
                        ({originalDays} {t('tripSuggestions.days')})
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="tpl-room-name">
                            {t('tripSuggestions.templateDialog.roomName')}
                        </Label>
                        <Input
                            id="tpl-room-name"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder={t(
                                'tripSuggestions.templateDialog.roomNamePlaceholder',
                            )}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="tpl-start-date">
                            {t('tripSuggestions.templateDialog.startDate')}
                        </Label>
                        <Input
                            id="tpl-start-date"
                            type="date"
                            value={startDate}
                            min={today}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                if (endDate && e.target.value > endDate)
                                    setEndDate('');
                            }}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="tpl-end-date">
                            {t('tripSuggestions.templateDialog.endDate')}
                        </Label>
                        <Input
                            id="tpl-end-date"
                            type="date"
                            value={endDate}
                            min={startDate || today}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={submitting}
                        >
                            {t('tripSuggestions.templateDialog.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                submitting ||
                                !roomName.trim() ||
                                !startDate ||
                                !endDate
                            }
                        >
                            {submitting
                                ? t('tripSuggestions.templateDialog.creating')
                                : t('tripSuggestions.templateDialog.create')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
