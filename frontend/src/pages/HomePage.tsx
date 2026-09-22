import { useMemo, useState } from 'react';

import { Butterfly } from '../components/mascots';
import { PollCard } from '../components/PollCard';
import { EmptyState } from '../components/ui';
import { cn } from '../lib/cn';
import { MOCK_POLLS } from '../lib/mockPolls';
import type { PollSort } from '../types/poll';

const SORT_TABS: { value: PollSort; label: string }[] = [
  { value: 'new', label: 'Yeni' },
  { value: 'hot', label: 'Gündemde' },
  { value: 'top', label: 'En Çok Oylanan' },
];

export function HomePage() {
  const [sort, setSort] = useState<PollSort>('new');
  // Render sirasinda Date.now() cagirmamak icin lazy initializer ile bir kere alinir.
  const [mountedAt] = useState(() => Date.now());

  // Faz 5'te gercek API cagrisina donusecek; simdilik mock veri uzerinde
  // basit bir siralama gosterimi.
  const polls = useMemo(() => {
    return [...MOCK_POLLS].sort((a, b) => {
      if (sort === 'top') return b.total_votes - a.total_votes;
      if (sort === 'hot') return b.total_votes / (mountedAt - new Date(a.created_at).getTime());
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [sort, mountedAt]);

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

      {polls.length === 0 ? (
        <EmptyState
          icon={Butterfly}
          title="Henüz anket yok"
          description="İlk anketi sen aç, kalabalık kararını versin."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
}
