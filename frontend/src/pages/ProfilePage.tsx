import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { toApiError } from '../api/errors';
import { myPolls } from '../api/polls';
import { queryKeys } from '../api/queryClient';
import { Sprout } from '../components/mascots';
import { PollCard } from '../components/PollCard';
import { Button, EmptyState, Input, Spinner, useToast } from '../components/ui';
import { type ProfileFormValues, profileSchema } from '../features/auth/schemas';
import { useAuth } from '../hooks/useAuth';

export function ProfilePage() {
  const { user, updateDisplayName } = useAuth();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: { display_name: user?.display_name ?? '' },
  });

  // Kullanici degisirse (orn. baska sekmede giris/cikis) formu senkronla.
  useEffect(() => {
    if (user) reset({ display_name: user.display_name });
  }, [user, reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await updateDisplayName(values.display_name);
      showToast('Profil güncellendi.', 'success');
    } catch (error) {
      showToast(toApiError(error).message, 'error');
    }
  };

  const { data, isPending, isError, error } = useQuery({
    queryKey: queryKeys.polls.mine({}),
    queryFn: () => myPolls(),
  });

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="font-heading text-2xl font-bold text-bark-800">Profilim</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 flex max-w-sm flex-col gap-4"
          noValidate
        >
          <Input
            label="Görünen ad"
            error={errors.display_name?.message}
            {...register('display_name')}
          />
          <Button type="submit" className="self-start" isLoading={isSubmitting} disabled={!isDirty}>
            Kaydet
          </Button>
        </form>
      </section>

      <section>
        <h2 className="font-heading text-lg font-semibold text-bark-800">Anketlerim</h2>
        <div className="mt-4 flex flex-col gap-4">
          {isPending ? (
            <div className="flex justify-center py-8">
              <Spinner label="Anketlerin yükleniyor" />
            </div>
          ) : isError ? (
            <p className="text-sm text-ladybug-600">{toApiError(error).message}</p>
          ) : data.results.length === 0 ? (
            <EmptyState
              icon={Sprout}
              title="Henüz anket açmadın"
              description="İlk anketini şimdi aç."
            />
          ) : (
            data.results.map((poll) => <PollCard key={poll.id} poll={poll} />)
          )}
        </div>
      </section>
    </div>
  );
}
