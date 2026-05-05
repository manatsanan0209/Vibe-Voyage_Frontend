import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/hooks/useI18n';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function SessionExpiredModal() {
    const { sessionExpired, clearSessionExpired } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();

    function handleSignIn() {
        clearSessionExpired();
        navigate('/signin');
    }

    return (
        <Dialog open={sessionExpired} onOpenChange={() => {}}>
            <DialogContent
                className="sm:max-w-sm"
                onPointerDownOutside={(e) => e.preventDefault()}
                showCloseButton={false}
            >
                <DialogHeader>
                    <DialogTitle>
                        {t('auth.sessionExpired.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('auth.sessionExpired.message')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button className="w-full" onClick={handleSignIn}>
                        {t('auth.sessionExpired.signIn')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
