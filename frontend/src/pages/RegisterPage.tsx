import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { Ladybug } from '../components/mascots';
import { Button, Input } from '../components/ui';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Faz 5'te gercek /auth/register/ cagrisi burada olacak.
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-6">
      <Ladybug size={48} title="What Is The Next?" />
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-bark-800">Kayıt Ol</h1>
        <p className="mt-1 text-sm text-bark-600">Anketlerinin üstünde görünecek bir ad seç.</p>
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
          label="Görünen ad"
          hint="3-32 karakter; harf, rakam ve alt çizgi kullanabilirsin."
          required
          minLength={3}
          maxLength={32}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <Input
          label="Şifre"
          type="password"
          autoComplete="new-password"
          hint="En az 8 karakter."
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" size="lg">
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
