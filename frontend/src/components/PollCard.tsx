import { Link } from 'react-router-dom';

import type { Poll } from '../types/poll';
import { formatRelativeTime } from '../lib/formatDate';
import { Badge } from './ui';
import { Daisy } from './mascots';
import { Card } from './ui';

interface PollCardProps {
  poll: Poll;
}

export function PollCard({ poll }: PollCardProps) {
  const leadingOption = poll.options.reduce(
    (max, option) => (option.vote_count > (max?.vote_count ?? -1) ? option : max),
    poll.options[0],
  );

  return (
    <Link to={`/polls/${poll.id}`} className="block">
      <Card interactive className="relative">
        <Daisy size={20} className="absolute -top-2 -right-2" />
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-lg font-semibold text-bark-800">{poll.question}</h3>
          <Badge tone={poll.status === 'open' ? 'leaf' : 'neutral'}>
            {poll.status === 'open' ? 'Açık' : 'Kapalı'}
          </Badge>
        </div>

        {poll.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-bark-600">{poll.description}</p>
        ) : null}

        <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-bark-600">
          <div>
            <dt className="sr-only">Oluşturan</dt>
            <dd>
              <span className="text-bark-800">{poll.author.display_name}</span>
            </dd>
          </div>
          <div>
            <dt className="sr-only">Toplam oy</dt>
            <dd>{poll.total_votes} oy</dd>
          </div>
          <div>
            <dt className="sr-only">Zaman</dt>
            <dd>{formatRelativeTime(poll.created_at)}</dd>
          </div>
        </dl>

        {leadingOption ? (
          <p className="mt-2 text-sm text-bark-600">
            Önde: <span className="font-medium text-bark-800">{leadingOption.text}</span>{' '}
            <span className="text-bark-400">(%{leadingOption.percentage.toFixed(0)})</span>
          </p>
        ) : null}
      </Card>
    </Link>
  );
}
