import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { toApiError } from '../api/errors';
import { Ladybug } from '../components/mascots';
import { Button, Input } from '../components/ui';
import { type RegisterFormValues, registerSchema } from '../features/auth/schemas';
import { useAuth } from '../hooks/useAuth';

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null);
    try {
      await registerUser(values);
      navigate('/', { replace: true });
    } catch (error) {
      setFormError(toApiError(error).message);
    }
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-6">
      <Ladybug size={48} title="What Is The Next?" />
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-bark-800">Kayıt Ol</h1>
        <p className="mt-1 text-sm text-bark-600">Anketlerinin üstünde görünecek bir ad seç.</p>
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
          label="Görünen ad"
          hint="3-32 karakter; harf, rakam ve alt çizgi kullanabilirsin."
          error={errors.display_name?.message}
          {...register('display_name')}
        />
        <Input
          label="Şifre"
          type="password"
          autoComplete="new-password"
          hint="En az 8 karakter."
          error={errors.password?.message}
          {...register('password')}
        />

        {formError ? (
          <p role="alert" aria-live="polite" className="text-sm font-medium text-ladybug-600">
            {formError}
          </p>
        ) : null}

        <Button type="submit" size="lg" isLoading={isSubmitting}>
          Kayıt Ol
        </Button>
      </form>

      <p className="text-sm text-bark-600">
        Zaten hesabın var mı?{' '}
        <Link to="/login" className="font-medium text-leaf-700 hover:underline">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
