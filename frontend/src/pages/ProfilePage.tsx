import { useState } from 'react';
import type { FormEvent } from 'react';

import { Sprout } from '../components/mascots';
import { PollCard } from '../components/PollCard';
import { Button, EmptyState, Input } from '../components/ui';
import { MOCK_POLLS } from '../lib/mockPolls';

export function ProfilePage() {
  // Faz 5'te gercek oturum kullanicisiyla degisecek.
  const [displayName, setDisplayName] = useState('kelebek_avcisi');
  const myPolls = MOCK_POLLS.slice(0, 1);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Faz 5'te gercek PATCH /auth/me/ cagrisi burada olacak.
  };

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="font-heading text-2xl font-bold text-bark-800">Profilim</h1>
        <form onSubmit={handleSubmit} className="mt-4 flex max-w-sm flex-col gap-4">
          <Input
            label="Görünen ad"
            minLength={3}
            maxLength={32}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Button type="submit" className="self-start">
            Kaydet
          </Button>
        </form>
      </section>

      <section>
        <h2 className="font-heading text-lg font-semibold text-bark-800">Anketlerim</h2>
        <div className="mt-4 flex flex-col gap-4">
          {myPolls.length === 0 ? (
            <EmptyState
              icon={Sprout}
              title="Henüz anket açmadın"
              description="İlk anketini şimdi aç."
            />
          ) : (
            myPolls.map((poll) => <PollCard key={poll.id} poll={poll} />)
          )}
        </div>
      </section>
    </div>
  );
}
