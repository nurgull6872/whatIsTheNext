import { z } from 'zod';

// polls/serializers.py::PollCreateSerializer ile birebir aynı kurallar (§1.1, §4.2).
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 5;

const optionSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Seçenek boş olamaz.')
    .max(120, 'Seçenek en fazla 120 karakter olabilir.'),
});

export const createPollSchema = z
  .object({
    question: z
      .string()
      .trim()
      .min(1, 'Soru boş olamaz.')
      .max(200, 'Soru en fazla 200 karakter olabilir.'),
    description: z.string().trim().max(500, 'Açıklama en fazla 500 karakter olabilir.').optional(),
    options: z
      .array(optionSchema)
      .min(MIN_OPTIONS, `En az ${MIN_OPTIONS} seçenek girmelisin.`)
      .max(MAX_OPTIONS, `En fazla ${MAX_OPTIONS} seçenek girebilirsin.`),
  })
  .refine(
    (data) => {
      const texts = data.options.map((o) => o.text.toLowerCase());
      return new Set(texts).size === texts.length;
    },
    { message: 'Seçenekler birbirinden farklı olmalı.', path: ['options'] },
  );

export type CreatePollFormValues = z.infer<typeof createPollSchema>;
