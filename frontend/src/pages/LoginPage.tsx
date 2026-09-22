import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { Ladybug } from '../components/mascots';
import { Button, Input } from '../components/ui';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Faz 5'te gercek /auth/login/ cagrisi burada olacak.
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-6">
      <Ladybug size={48} title="What Is The Next?" />
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-bark-800">Giriş Yap</h1>
        <p className="mt-1 text-sm text-bark-600">Anket açmak için üye olman gerekiyor.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <Input
          label="E-posta"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Şifre"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" size="lg">
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
