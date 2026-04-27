import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import type { SigninRequestDTO } from '@/types/auth';
import { useI18n } from '@/hooks/useI18n';

export default function FormSignIn() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { t } = useI18n();
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [form, setForm] = useState<SigninRequestDTO>({
        username: '',
        password: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        if (!form.username || !form.password) {
            setError(t('authForm.signInMissing'));
            return;
        }

        setIsSubmitting(true);

        try {
            await login(form, rememberMe);
            navigate('/');
        } catch (err) {
            setError(t('authForm.signInFailed'));
            console.error('Login error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm justify-center flex flex-col gap-6"
        >
            <FieldSet className="w-full">
                <FieldGroup>
                    <Field className="w-full">
                        <FieldLabel htmlFor="username">
                            {t('authForm.username')}
                        </FieldLabel>
                        <Input
                            id="username"
                            type="text"
                            placeholder={t('authForm.usernamePlaceholder')}
                            className="h-10"
                            value={form.username}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    username: event.target.value,
                                }))
                            }
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="password">
                            {t('authForm.password')}
                        </FieldLabel>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder={t('authForm.passwordPlaceholder')}
                                className="h-10 pr-10"
                                value={form.password}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        password: event.target.value,
                                    }))
                                }
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={
                                    showPassword
                                        ? t('authForm.hidePassword')
                                        : t('authForm.showPassword')
                                }
                                aria-pressed={showPassword}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </Field>

                    <Field
                        orientation="horizontal"
                        className="items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="remember-me"
                                name="rememberMe"
                                checked={rememberMe}
                                onCheckedChange={(checked) =>
                                    setRememberMe(checked === true)
                                }
                            />
                            <FieldLabel
                                htmlFor="remember-me"
                                className="text-muted-foreground font-normal"
                            >
                                {t('authForm.rememberMe')}
                            </FieldLabel>
                        </div>
                    </Field>
                </FieldGroup>
            </FieldSet>

            {error ? (
                <p className="text-center text-sm text-red-600">{error}</p>
            ) : null}

            <div className="mt-4 flex justify-center">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-10/12 h-auto rounded-md font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    {isSubmitting ? t('authForm.signingIn') : t('authForm.signIn')}
                </Button>
            </div>
            <p className="mt-5 justify-center text-center font-normal text-muted-foreground text-sm">
                {t('authForm.noAccount')}{' '}
                <a
                    href="/signup"
                    className="text-muted-foreground font-semibold hover:underline"
                >
                    {t('authForm.signUpLink')}
                </a>
            </p>
        </form>
    );
}
