import logo from '../../assets/Vibe-voyage-Logo.png';
import { useI18n } from '@/hooks/useI18n';

export default function AuthLogo() {
    const { t } = useI18n();

    return (
        <div className="flex flex-col items-center text-center">
            <img className="w-1/5" src={logo} alt="Vibe Voyage Logo" />
            <p className="text-lg font-bold text-primary">
                {t('authLogo.welcome')}
            </p>
            <p className="mt-2 text-sm font-light text-primary">
                {t('authLogo.taglinePrefix')}{' '}
                <span className="font-light text-accent-foreground">
                    {t('authLogo.vibe')}
                </span>{' '}
                {t('authLogo.taglineSuffix')}
            </p>
        </div>
    );
}
