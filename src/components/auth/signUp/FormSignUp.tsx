import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import type { ApiErrorResponseDTO, ApiResponseDTO } from '@/types/api';
import type { RegisterRequestDTO, RegisterResponseDTO } from '@/types/auth';
import { useNavigate } from 'react-router-dom';

export default function FormSignUp() {
    const navigate = useNavigate();
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

    const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(
        /\/$/,
        '',
    );

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        if (
            !form.full_name ||
            !form.username ||
            !form.email ||
            !form.password
        ) {
            setError('Please fill in all fields.');
            return;
        }

        if (form.password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);

        try {
            const { data } = await axios.post<
                ApiResponseDTO<RegisterResponseDTO>
            >(`${apiBaseUrl}/auth/register`, form);
            const payload = data.data;

            localStorage.setItem('token', payload.token);
            localStorage.setItem('expires_at', payload.expires_at);
            localStorage.setItem('user_id', String(payload.id));
            localStorage.setItem('username', payload.username);
            localStorage.setItem('remember_me', 'false');

            navigate('/');
        } catch (err) {
            if (axios.isAxiosError<ApiErrorResponseDTO>(err)) {
                const message =
                    err.response?.data?.error || err.response?.data?.message;
                setError(message || 'Sign up failed. Please try again.');
            } else {
                setError('Sign up failed. Please try again.');
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
                        <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                        <Input
                            id="fullName"
                            type="text"
                            placeholder="Enter your Full Name"
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
                        <FieldLabel htmlFor="username">Username</FieldLabel>
                        <Input
                            id="username"
                            type="text"
                            placeholder="Enter your Username"
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
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                            id="email"
                            type="text"
                            placeholder="Enter your Email"
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
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your Password"
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
                                        ? 'Hide password'
                                        : 'Show password'
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
                            Confirm Password
                        </FieldLabel>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm your Password"
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
                    className="w-10/12 h-auto rounded-md font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                >
                    {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                </Button>
            </div>
            <p className=" mt-4 justify-center text-center font-normal text-muted-foreground text-sm">
                Already have an account?{' '}
                <a
                    href="/signin"
                    className="text-indigo-400 font-semibold hover:underline"
                >
                    Sign In
                </a>
            </p>
        </form>
    );
}
