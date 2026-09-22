# What Is The Next? 🐞🌼

> Karar veremediğinde kalabalığa sor.

Bir konuda karar veremeyen kullanıcı 2–5 seçenekli bir anket açar, topluluk oy verir.
Anket açmak için üyelik gerekir; **oy vermek herkese açıktır.**

Ayrıntılı ürün tanımı, veri modeli, API sözleşmesi ve faz planı için:
**[PROJE_PLANI.md](PROJE_PLANI.md)**

---

## Teknoloji

| Katman | Teknoloji |
|---|---|
| Backend | Django 5.2 + Django REST Framework + SimpleJWT |
| Frontend | React 19 + Vite 8 + TypeScript + Tailwind CSS v4 |
| Veritabanı | Supabase (PostgreSQL) |
| Deployment | Vercel |

---

## Kurulum

### Gereksinimler

- Python 3.11+
- Node.js 20+
- Bir Supabase projesi (ücretsiz katman yeterli)

### Backend

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1
# Git Bash / macOS / Linux
source .venv/Scripts/activate

pip install -r requirements-dev.txt
cp .env.example .env          # sonra .env icini doldur
python manage.py migrate
python manage.py runserver
```

Backend: <http://localhost:8000>

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend: <http://localhost:5173>

---

## Komutlar

### Backend

| Komut | Açıklama |
|---|---|
| `python manage.py runserver` | Geliştirme sunucusu |
| `python manage.py makemigrations` | Migration üret |
| `python manage.py migrate` | Migration uygula |
| `python manage.py createsuperuser` | Admin kullanıcısı |
| `pytest` | Testler |
| `ruff check .` | Lint |
| `black .` | Format |

### Frontend

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi |
| `npm run preview` | Derlemeyi lokalde çalıştır |
| `npm run typecheck` | TypeScript kontrolü |
| `npm run lint` | oxlint |
| `npm run format` | Prettier |

---

## Proje Yapısı

```
whatIsTheNext/
├── PROJE_PLANI.md      # Tam proje planı ve faz listesi
├── backend/            # Django + DRF API
│   ├── config/         # Ayarlar, kök URL yapılandırması
│   ├── accounts/       # Kullanıcı modeli ve kimlik doğrulama
│   └── polls/          # Anket, seçenek, oy
└── frontend/           # React + Vite arayüz
    └── src/
```

---

## Geliştirme Akışı

Her faz kendi dalında geliştirilir, `main`'e `--no-ff` ile merge edilir ve etiketlenir.
Commit formatı [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(polls): add vote endpoint for members and guests
```

Ayrıntı: [PROJE_PLANI.md § 9](PROJE_PLANI.md#9-git-akışı)

---

## Durum

| Faz | Durum |
|---|---|
| 0 — Temel kurulum | ✅ Tamamlandı |
| 1 — Veritabanı ve modeller | ✅ Tamamlandı |
| 2 — Kimlik doğrulama API | ⬜ |
| 3 — Anket ve oylama API | ⬜ |
| 4 — Tasarım sistemi | ⬜ |
| 5 — Frontend entegrasyonu | ⬜ |
| 6 — Deployment | ⬜ |
| 7 — Cila ve sertleştirme | ⬜ |
