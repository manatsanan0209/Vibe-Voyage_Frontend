import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import AuthLogo from '../components/auth/AuthLogo';
import FormSignIn from '../components/auth/signIn/FormSignIn';
import bg from '../assets/bg.jpeg';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/hooks/useI18n';

export default function SignIn() {
    const navigate = useNavigate();
    const { t } = useI18n();

    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-14 bg-secondary">
            <div className="flex h-11/12 w-11/12 flex-col overflow-y-auto rounded-4xl bg-white shadow-lg md:flex-row md:overflow-hidden">
                <div className="relative hidden h-full md:block md:w-1/2">
                    <img
                        src={bg}
                        className="w-full h-full object-cover"
                        alt="Background"
                    />
                    <Button
                        onClick={() => navigate(-1)}
                        className="absolute left-4 top-4 text-primary-foreground bg-white/10 hover:bg-white/20"
                    >
                        <IoArrowBack />
                        {t('common.back')}
                    </Button>
                </div>
                <div className="flex min-h-full w-full flex-col items-center px-5 py-6 md:h-full md:min-h-0 md:w-1/2 md:justify-center md:px-6 md:py-10">
                    <Button
                        onClick={() => navigate(-1)}
                        variant="ghost"
                        className="mb-4 self-start text-primary md:hidden"
                    >
                        <IoArrowBack />
                        {t('common.back')}
                    </Button>
                    <AuthLogo />
                    <div className="h-1/12 w-full" />
                    <FormSignIn />
                </div>
            </div>
        </div>
    );
}
