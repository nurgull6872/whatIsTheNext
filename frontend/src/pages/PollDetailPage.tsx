import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';

import { toApiError } from '../api/errors';
import { closePoll, deletePoll, getPoll, votePoll } from '../api/polls';
import { queryKeys } from '../api/queryClient';
import { Sprout } from '../components/mascots';
import { OptionBar } from '../components/OptionBar';
import { Badge, Button, EmptyState, Spinner, useToast } from '../components/ui';
import { formatRelativeTime } from '../lib/formatDate';
import { useAuth } from '../hooks/useAuth';
import type { Poll } from '../types/poll';

export function PollDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const {
    data: poll,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.polls.detail(id ?? ''),
    queryFn: () => getPoll(id!),
    enabled: Boolean(id),
  });

  const voteMutation = useMutation({
    mutationFn: (optionId: string) => votePoll(id!, optionId),
    onMutate: async (optionId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.polls.detail(id!) });
      const previous = queryClient.getQueryData<Poll>(queryKeys.polls.detail(id!));

      // İyimser güncelleme: oy verilince çubuk anında dolar (§7 optimistic update).
      if (previous) {
        const optimistic: Poll = {
          ...previous,
          my_vote: optionId,
          total_votes: previous.total_votes + 1,
          options: previous.options.map((o) =>
            o.id === optionId ? { ...o, vote_count: o.vote_count + 1 } : o,
          ),
        };
        const total = optimistic.total_votes;
        optimistic.options = optimistic.options.map((o) => ({
          ...o,
          percentage: total ? Math.round((o.vote_count / total) * 1000) / 10 : 0,
        }));
        queryClient.setQueryData(queryKeys.polls.detail(id!), optimistic);
      }
      return { previous };
    },
    onError: (err, _optionId, context) => {
      // Hata olursa geri al (§7).
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.polls.detail(id!), context.previous);
      }
      showToast(toApiError(err).message, 'error');
    },
    onSuccess: (updatedPoll) => {
      queryClient.setQueryData(queryKeys.polls.detail(id!), updatedPoll);
      void queryClient.invalidateQueries({ queryKey: ['polls', 'list'] });
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => closePoll(id!),
    onSuccess: (updatedPoll) => {
      queryClient.setQueryData(queryKeys.polls.detail(id!), updatedPoll);
      void queryClient.invalidateQueries({ queryKey: ['polls', 'list'] });
      showToast('Anket kapatıldı.', 'success');
    },
    onError: (err) => showToast(toApiError(err).message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePoll(id!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['polls'] });
      showToast('Anket silindi.', 'success');
      window.location.href = '/';
    },
    onError: (err) => showToast(toApiError(err).message, 'error'),
  });

  if (isPending) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Anket yükleniyor" />
      </div>
    );
  }

  if (isError || !poll) {
    const notFound = toApiError(error).status === 404;
    return (
      <EmptyState
        icon={Sprout}
        title={notFound ? 'Anket bulunamadı' : 'Anket yüklenemedi'}
        description={
          notFound ? 'Bu anket silinmiş ya da hiç var olmamış olabilir.' : toApiError(error).message
        }
        action={
          <Link to="/" className="font-medium text-leaf-700 hover:underline">
            Anketlere dön
          </Link>
        }
      />
    );
  }

  const maxVotes = Math.max(0, ...poll.options.map((o) => o.vote_count));
  const isClosed = poll.status === 'closed';
  const isOwner = user?.display_name === poll.author.display_name;
  const canVote = poll.is_open && !poll.my_vote;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Bağlantı kopyalandı.', 'success');
    } catch {
      showToast('Bağlantı kopyalanamadı.', 'error');
    }
  };

  return (
    <article className="flex flex-col gap-5">
      <div>
        <div className="flex items-center gap-2">
          <Badge tone={poll.status === 'open' ? 'leaf' : 'neutral'}>
            {poll.status === 'open' ? 'Açık' : 'Kapalı'}
          </Badge>
          {!poll.allow_guest_votes ? <Badge tone="honey">Sadece üyeler</Badge> : null}
        </div>
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
            isSelected={poll.my_vote === option.id}
            isWinner={isClosed && option.vote_count === maxVotes && maxVotes > 0}
            disabled={!canVote || voteMutation.isPending}
            onSelect={canVote ? () => voteMutation.mutate(option.id) : undefined}
          />
        ))}
      </div>

      {canVote ? (
        <p className="text-sm text-bark-600">Bir seçeneğe tıklayarak oy verebilirsin.</p>
      ) : null}
      {poll.my_vote ? (
        <p className="text-sm font-medium text-leaf-700">Oyun kaydedildi, teşekkürler! 🐞</p>
      ) : null}
      {isClosed ? <p className="text-sm text-bark-600">Bu anket artık oy kabul etmiyor.</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" type="button" onClick={handleCopyLink}>
          Bağlantıyı kopyala
        </Button>
        {isOwner && !isClosed ? (
          <Button
            variant="secondary"
            size="sm"
            type="button"
            isLoading={closeMutation.isPending}
            onClick={() => closeMutation.mutate()}
          >
            Anketi kapat
          </Button>
        ) : null}
        {isOwner ? (
          <Button
            variant="danger"
            size="sm"
            type="button"
            isLoading={deleteMutation.isPending}
            onClick={() => {
              if (window.confirm('Bu anketi silmek istediğine emin misin?')) {
                deleteMutation.mutate();
              }
            }}
          >
            Sil
          </Button>
        ) : null}
      </div>
    </article>
  );
}
