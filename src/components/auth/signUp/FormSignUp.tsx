import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import type { ApiErrorResponseDTO } from '@/types/api';
import type { RegisterRequestDTO } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/hooks/useI18n';

export default function FormSignUp() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const { t } = useI18n();
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [form, setForm] = useState<RegisterRequestDTO>({
        username: '',
        email: '',
        password: '',
        full_name: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        if (
            !form.full_name ||
            !form.username ||
            !form.email ||
            !form.password
        ) {
            setError(t('authForm.signUpMissing'));
            return;
        }

        if (form.password !== confirmPassword) {
            setError(t('authForm.signUpPasswordMismatch'));
            return;
        }

        setIsSubmitting(true);

        try {
            await register(form);
            navigate('/');
        } catch (err) {
            if (axios.isAxiosError<ApiErrorResponseDTO>(err)) {
                const message =
                    err.response?.data?.error || err.response?.data?.message;
                setError(message || t('authForm.signUpFailed'));
            } else {
                setError(t('authForm.signUpFailed'));
            }
            console.error('Sign up error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm justify-center flex flex-col mt-2"
        >
            <FieldSet className="w-full">
                <FieldGroup>
                    <Field className="w-full">
                        <FieldLabel htmlFor="fullName">
                            {t('authForm.fullName')}
                        </FieldLabel>
                        <Input
                            id="fullName"
                            type="text"
                            placeholder={t('authForm.fullNamePlaceholder')}
                            className="h-10"
                            value={form.full_name}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    full_name: event.target.value,
                                }))
                            }
                        />
                    </Field>
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
                    <Field className="w-full">
                        <FieldLabel htmlFor="email">{t('authForm.email')}</FieldLabel>
                        <Input
                            id="email"
                            type="text"
                            placeholder={t('authForm.emailPlaceholder')}
                            className="h-10"
                            value={form.email}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    email: event.target.value,
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
                    <Field className="w-full">
                        <FieldLabel htmlFor="confirmPassword">
                            {t('authForm.confirmPassword')}
                        </FieldLabel>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder={t('authForm.confirmPasswordPlaceholder')}
                            className="h-10"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                        />
                    </Field>
                </FieldGroup>
            </FieldSet>

            {error ? (
                <p className="mt-4 text-center text-sm text-red-600">{error}</p>
            ) : null}

            <div className="flex justify-center mt-7">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-10/12 h-auto rounded-md font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    {isSubmitting ? t('authForm.signingUp') : t('authForm.signUp')}
                </Button>
            </div>
            <p className=" mt-4 justify-center text-center font-normal text-muted-foreground text-sm">
                {t('authForm.haveAccount')}{' '}
                <a
                    href="/signin"
                    className="text-muted-foreground font-semibold hover:underline"
                >
                    {t('authForm.signInLink')}
                </a>
            </p>
        </form>
    );
}
