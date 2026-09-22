import { z } from 'zod';

// accounts/models.py::display_name_validator ile birebir aynı kural.
const DISPLAY_NAME_REGEX = /^[a-zA-Z0-9_çğıöşüÇĞİÖŞÜ]{3,32}$/;

export const loginSchema = z.object({
  email: z.string().min(1, 'E-posta zorunludur.').email('Geçerli bir e-posta gir.'),
  password: z.string().min(1, 'Şifre zorunludur.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().min(1, 'E-posta zorunludur.').email('Geçerli bir e-posta gir.'),
  display_name: z
    .string()
    .min(3, 'Ad en az 3 karakter olmalı.')
    .max(32, 'Ad en fazla 32 karakter olabilir.')
    .regex(DISPLAY_NAME_REGEX, 'Sadece harf, rakam ve alt çizgi kullanabilirsin.'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı.'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const profileSchema = z.object({
  display_name: z
    .string()
    .min(3, 'Ad en az 3 karakter olmalı.')
    .max(32, 'Ad en fazla 32 karakter olabilir.')
    .regex(DISPLAY_NAME_REGEX, 'Sadece harf, rakam ve alt çizgi kullanabilirsin.'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
