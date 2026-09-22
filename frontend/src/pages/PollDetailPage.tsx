import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Sprout } from '../components/mascots';
import { OptionBar } from '../components/OptionBar';
import { Badge, Button, EmptyState } from '../components/ui';
import { formatRelativeTime } from '../lib/formatDate';
import { MOCK_POLLS } from '../lib/mockPolls';

export function PollDetailPage() {
  const { id } = useParams<{ id: string }>();
  const poll = MOCK_POLLS.find((p) => p.id === id);

  // Faz 5'te gercek oy verme mutasyonuna baglanacak; simdilik yerel state.
  const [myVote, setMyVote] = useState<string | null>(poll?.my_vote ?? null);

  if (!poll) {
    return (
      <EmptyState
        icon={Sprout}
        title="Anket bulunamadı"
        description="Bu anket silinmiş ya da hiç var olmamış olabilir."
        action={
          <Link to="/" className="font-medium text-leaf-700 hover:underline">
            Anketlere dön
          </Link>
        }
      />
    );
  }

  const maxVotes = Math.max(...poll.options.map((o) => o.vote_count));
  const isClosed = poll.status === 'closed';

  return (
    <article className="flex flex-col gap-5">
      <div>
        <Badge tone={poll.status === 'open' ? 'leaf' : 'neutral'}>
          {poll.status === 'open' ? 'Açık' : 'Kapalı'}
        </Badge>
        <h1 className="mt-2 font-heading text-2xl font-bold text-bark-800">{poll.question}</h1>
        {poll.description ? <p className="mt-1 text-bark-600">{poll.description}</p> : null}
        <p className="mt-2 text-sm text-bark-400">
          <span className="text-bark-600">{poll.author.display_name}</span> tarafından{' '}
          {formatRelativeTime(poll.created_at)} açıldı · {poll.total_votes} oy
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {poll.options.map((option, index) => (
          <OptionBar
            key={option.id}
            option={option}
            colorIndex={index}
            isSelected={myVote === option.id}
            isWinner={isClosed && option.vote_count === maxVotes && maxVotes > 0}
            disabled={Boolean(myVote) || isClosed}
            onSelect={() => setMyVote(option.id)}
          />
        ))}
      </div>

      {!myVote && !isClosed ? (
        <p className="text-sm text-bark-600">Bir seçeneğe tıklayarak oy verebilirsin.</p>
      ) : null}
      {myVote ? (
        <p className="text-sm font-medium text-leaf-700">Oyun kaydedildi, teşekkürler! 🐞</p>
      ) : null}
      {isClosed ? <p className="text-sm text-bark-600">Bu anket artık oy kabul etmiyor.</p> : null}

      <div>
        <Button variant="ghost" size="sm" type="button">
          Bağlantıyı kopyala
        </Button>
      </div>
    </article>
  );
}
