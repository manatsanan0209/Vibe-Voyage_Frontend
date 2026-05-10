import axios from 'axios';
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
import { differenceInDays, parseISO, addDays, format } from 'date-fns';

interface UseAsTemplateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    publishedTripId: number;
    destinationName: string;
    originalDays: number;
}

function getApiErrorMessage(err: unknown, lang: string): string {
    if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg: string =
            err.response?.data?.error || err.response?.data?.message || '';

        if (status === 403) {
            return lang === 'th'
                ? 'ไม่สามารถใช้ทริปของตัวเองหรือทริปที่เป็นสมาชิกอยู่เป็น template ได้'
                : 'You cannot use a trip you already belong to as a template.';
        }
        if (status === 400 && msg) {
            return msg;
        }
    }
    return lang === 'th'
        ? 'ไม่สามารถสร้างทริปได้ กรุณาลองใหม่อีกครั้ง'
        : 'Failed to create trip. Please try again.';
}

export default function UseAsTemplateDialog({
    open,
    onOpenChange,
    publishedTripId,
    destinationName,
    originalDays,
}: UseAsTemplateDialogProps) {
    const { t, lang } = useI18n();
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

    const today = new Date().toISOString().split('T')[0];

    // minimum end date = start + (originalDays - 1) days
    const minEndDate = startDate
        ? format(addDays(parseISO(startDate), originalDays - 1), 'yyyy-MM-dd')
        : today;

    const selectedDays =
        startDate && endDate
            ? differenceInDays(parseISO(endDate), parseISO(startDate)) + 1
            : 0;

    const durationShort = !!(
        startDate &&
        endDate &&
        selectedDays < originalDays
    );

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!roomName.trim() || !startDate || !endDate) return;
        if (durationShort) return;

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
                state: {
                    fromCreateTrip: true,
                    createdAt: Date.now(),
                    roomName: roomName.trim(),
                },
            });
        } catch (err) {
            setError(getApiErrorMessage(err, lang));
        } finally {
            setSubmitting(false);
        }
    }

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
                            min={minEndDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            disabled={!startDate}
                            required
                        />
                        <p className="text-xs text-foreground/50">
                            {lang === 'th'
                                ? `ต้องเลือกอย่างน้อย ${originalDays} วัน`
                                : `Minimum ${originalDays} day${originalDays > 1 ? 's' : ''} required`}
                            {selectedDays > 0 &&
                                selectedDays > originalDays && (
                                    <span className="ml-1 text-amber-600">
                                        ({selectedDays}{' '}
                                        {t('tripSuggestions.days')} —{' '}
                                        {lang === 'th'
                                            ? `${selectedDays - originalDays} วันจะว่างเปล่า`
                                            : `${selectedDays - originalDays} day${selectedDays - originalDays > 1 ? 's' : ''} will be empty`}
                                        )
                                    </span>
                                )}
                        </p>
                    </div>

                    {durationShort && (
                        <p className="text-sm text-red-600">
                            {lang === 'th'
                                ? `ต้องเลือกอย่างน้อย ${originalDays} วัน เพื่อให้ตรงกับ template`
                                : `Select at least ${originalDays} days to match the template.`}
                        </p>
                    )}

                    {error && <p className="text-sm text-red-600">{error}</p>}

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
                                !endDate ||
                                durationShort
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
