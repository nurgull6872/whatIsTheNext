import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { listPolls } from '../api/polls';
import { queryKeys } from '../api/queryClient';
import { Butterfly, Sprout } from '../components/mascots';
import { PollCard } from '../components/PollCard';
import { EmptyState, Spinner } from '../components/ui';
import { cn } from '../lib/cn';
import type { PollSort } from '../types/poll';

const SORT_TABS: { value: PollSort; label: string }[] = [
  { value: 'new', label: 'Yeni' },
  { value: 'hot', label: 'Gündemde' },
  { value: 'top', label: 'En Çok Oylanan' },
];

export function HomePage() {
  const [sort, setSort] = useState<PollSort>('new');
  const params = { sort };

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.polls.list(params),
    queryFn: () => listPolls(params),
  });

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-card bg-leaf-100/50 px-6 py-8 text-center">
        <h1 className="font-heading text-2xl font-bold text-bark-800 sm:text-3xl">
          Karar veremiyor musun? 🐞
        </h1>
        <p className="mx-auto mt-2 max-w-md text-bark-600">
          Bir anket aç, kalabalık senin için karar versin.
        </p>
      </section>

      <div
        className="flex gap-1 rounded-full bg-leaf-100/40 p-1"
        role="tablist"
        aria-label="Sıralama"
      >
        {SORT_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={sort === tab.value}
            onClick={() => setSort(tab.value)}
            className={cn(
              'flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors',
              sort === tab.value ? 'bg-garden-card text-leaf-700 shadow-garden' : 'text-bark-600',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isPending ? (
        <div className="flex justify-center py-16">
          <Spinner label="Anketler yükleniyor" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={Butterfly}
          title="Anketler yüklenemedi"
          description={error.message}
          action={
            <button
              type="button"
              onClick={() => refetch()}
              className="font-medium text-leaf-700 hover:underline"
            >
              Tekrar dene
            </button>
          }
        />
      ) : data.results.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="Henüz anket yok"
          description="İlk anketi sen aç, kalabalık kararını versin."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {data.results.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
}
