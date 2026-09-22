import { useState } from 'react';
import type { FormEvent } from 'react';

import { Button, Input } from '../components/ui';

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 5;

export function CreatePollPage() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [error, setError] = useState<string | null>(null);

  const addOption = () => {
    if (options.length < MAX_OPTIONS) setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > MIN_OPTIONS) setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    setOptions(options.map((opt, i) => (i === index ? value : opt)));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!question.trim()) {
      setError('Soru boş olamaz.');
      return;
    }
    const filled = options.map((o) => o.trim()).filter(Boolean);
    if (filled.length < MIN_OPTIONS) {
      setError(`En az ${MIN_OPTIONS} seçenek girmelisin.`);
      return;
    }
    if (new Set(filled.map((o) => o.toLowerCase())).size !== filled.length) {
      setError('Seçenekler birbirinden farklı olmalı.');
      return;
    }

    // Faz 5'te gercek API cagrisi burada olacak.
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-lg flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl font-bold text-bark-800">Anket Oluştur</h1>
        <p className="mt-1 text-sm text-bark-600">
          En az {MIN_OPTIONS}, en fazla {MAX_OPTIONS} seçenek girebilirsin.
        </p>
      </div>

      <Input
        label="Soru"
        placeholder="Örn. Akşam ne yesek?"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        maxLength={200}
      />

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium text-bark-800">Seçenekler</legend>
        {options.map((option, index) => (
          <div key={index} className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label={`Seçenek ${index + 1}`}
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                maxLength={120}
              />
            </div>
            {options.length > MIN_OPTIONS ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeOption(index)}
                aria-label={`Seçenek ${index + 1}'i sil`}
              >
                ✕
              </Button>
            ) : null}
          </div>
        ))}

        {options.length < MAX_OPTIONS ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addOption}
            className="self-start"
          >
            + Seçenek Ekle
          </Button>
        ) : null}
      </fieldset>

      {error ? (
        <p role="alert" aria-live="polite" className="text-sm font-medium text-ladybug-600">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg">
        Anketi Yayınla
      </Button>
    </form>
  );
}
