import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { toApiError } from '../api/errors';
import { createPoll } from '../api/polls';
import { Button, Input, useToast } from '../components/ui';
import {
  type CreatePollFormValues,
  MAX_OPTIONS,
  MIN_OPTIONS,
  createPollSchema,
} from '../features/polls/schemas';

export function CreatePollPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreatePollFormValues>({
    resolver: zodResolver(createPollSchema),
    defaultValues: { question: '', description: '', options: [{ text: '' }, { text: '' }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'options' });

  const mutation = useMutation({
    mutationFn: createPoll,
    onSuccess: async (poll) => {
      await queryClient.invalidateQueries({ queryKey: ['polls'] });
      showToast('Anket yayınlandı!', 'success');
      navigate(`/polls/${poll.id}`);
    },
    onError: (error) => {
      const apiError = toApiError(error);
      setError('root', { message: apiError.message });
    },
  });

  const onSubmit = (values: CreatePollFormValues) => {
    mutation.mutate({
      question: values.question,
      description: values.description || undefined,
      options: values.options,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex max-w-lg flex-col gap-5"
      noValidate
    >
      <div>
        <h1 className="font-heading text-2xl font-bold text-bark-800">Anket Oluştur</h1>
        <p className="mt-1 text-sm text-bark-600">
          En az {MIN_OPTIONS}, en fazla {MAX_OPTIONS} seçenek girebilirsin.
        </p>
      </div>

      <Input
        label="Soru"
        placeholder="Örn. Akşam ne yesek?"
        error={errors.question?.message}
        {...register('question')}
      />

      <Input
        label="Açıklama (opsiyonel)"
        placeholder="Ek bağlam ekleyebilirsin."
        error={errors.description?.message}
        {...register('description')}
      />

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium text-bark-800">Seçenekler</legend>
        <AnimatePresence initial={false}>
          {fields.map((field, index) => (
            <motion.div
              key={field.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-end gap-2 overflow-hidden"
            >
              <div className="flex-1">
                <Input
                  label={`Seçenek ${index + 1}`}
                  error={errors.options?.[index]?.text?.message}
                  {...register(`options.${index}.text`)}
                />
              </div>
              {fields.length > MIN_OPTIONS ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  aria-label={`Seçenek ${index + 1}'i sil`}
                >
                  ✕
                </Button>
              ) : null}
            </motion.div>
          ))}
        </AnimatePresence>

        {errors.options?.message || errors.options?.root?.message ? (
          <p role="alert" aria-live="polite" className="text-sm font-medium text-ladybug-600">
            {errors.options.message ?? errors.options.root?.message}
          </p>
        ) : null}

        {fields.length < MAX_OPTIONS ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => append({ text: '' })}
            className="self-start"
          >
            + Seçenek Ekle
          </Button>
        ) : null}
      </fieldset>

      {errors.root ? (
        <p role="alert" aria-live="polite" className="text-sm font-medium text-ladybug-600">
          {errors.root.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" isLoading={isSubmitting || mutation.isPending}>
        Anketi Yayınla
      </Button>
    </form>
  );
}
