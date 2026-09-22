import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { toApiError } from '../api/errors';
import { Ladybug } from '../components/mascots';
import { Button, Input } from '../components/ui';
import { type LoginFormValues, loginSchema } from '../features/auth/schemas';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      await login(values);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? '/', { replace: true });
    } catch (error) {
      const apiError = toApiError(error);
      setFormError(apiError.status === 401 ? 'E-posta veya şifre hatalı.' : apiError.message);
    }
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-6">
      <Ladybug size={48} title="What Is The Next?" />
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-bark-800">Giriş Yap</h1>
        <p className="mt-1 text-sm text-bark-600">Anket açmak için üye olman gerekiyor.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4" noValidate>
        <Input
          label="E-posta"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Şifre"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {formError ? (
          <p role="alert" aria-live="polite" className="text-sm font-medium text-ladybug-600">
            {formError}
          </p>
        ) : null}

        <Button type="submit" size="lg" isLoading={isSubmitting}>
          Giriş Yap
        </Button>
      </form>

      <p className="text-sm text-bark-600">
        Hesabın yok mu?{' '}
        <Link to="/register" className="font-medium text-leaf-700 hover:underline">
          Kayıt ol
        </Link>
      </p>
    </div>
  );
}
