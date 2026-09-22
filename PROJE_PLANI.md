# What Is The Next? 🐞🌼

> Karar veremediğinde kalabalığa sor.

Kullanıcı bir konuda karar veremediğinde 2–5 seçenekli bir anket açar; topluluk oy verir ve
"sırada ne var" sorusu kalabalığın kararıyla cevaplanır.

---

## 1. Ürün Tanımı

### 1.1 Temel Kurallar

| Kural | Açıklama |
|---|---|
| Anket oluşturma | **Sadece üye olan** kullanıcılar anket açabilir. |
| Oy verme | **Herkes** oy verebilir (üye olmayan ziyaretçiler dahil). |
| Seçenek sayısı | En az **2**, en fazla **5** seçenek. |
| Kimlik | E-posta + şifre ile kayıt / giriş. |
| Görünen ad | Kullanıcı kendine bir **takma ad (display name)** seçer; anketlerin üstünde bu ad görünür. |

### 1.2 Kullanıcı Rolleri

- **Ziyaretçi (Guest):** Anketleri listeler, detayını görür, oy verebilir. Anket açamaz.
- **Üye (Member):** Ziyaretçinin yaptığı her şey + anket oluşturma, kendi anketini kapatma/silme, profil düzenleme.

### 1.3 Anket Yaşam Döngüsü

```
AÇIK → [süre dolar veya sahibi kapatır] → KAPALI
```

- Açık anket: oy alır, sonuçlar canlı gösterilir.
- Kapalı anket: oy alamaz, sonuç kilitlenir, kazanan seçenek vurgulanır.
- Her anketin opsiyonel bir `closes_at` alanı olur (varsayılan: +7 gün).

### 1.4 Mükerrer Oy Engelleme

Oy verme herkese açık olduğu için tek kimlik yeterli değil. Katmanlı yaklaşım:

1. **Üye ise:** `(anket, kullanıcı)` üzerinde `UNIQUE` kısıt. Kesin çözüm.
2. **Ziyaretçi ise:** tarayıcıda üretilen `voter_token` (UUID v4, `HttpOnly` cookie +
   `localStorage` yedeği) ile `(anket, voter_token)` üzerinde `UNIQUE`.
3. **Ek katman:** IP + User-Agent hash'i ile rate limit (aynı IP'den dakikada N oy).

> Not: Bu yöntem kararlı kötüye kullanımı %100 engellemez — açık oylamanın doğası bu.
> Amaç kazara ve kolay mükerrer oyu engellemek. İleride "oy vermek için üyelik zorunlu"
> modu anket bazında opsiyon olarak eklenir (Faz 7).

### 1.5 Kapsam Dışı (v1'de yok)

Yorumlar, bildirimler, sosyal giriş (Google/Apple), görsel yükleme, takip sistemi, mobil uygulama.
Bunlar "Gelecek Fikirler" bölümünde.

---

## 2. Teknoloji Yığını

### 2.1 İstenen Yığın

| Katman | Teknoloji |
|---|---|
| Backend | **Django** + Django REST Framework |
| Frontend | **React** |
| Veritabanı | **Supabase** (yönetilen PostgreSQL) |
| Deployment | **Vercel** |

### 2.2 Önerilen Eklemeler (gerekçeli)

| Teknoloji | Neden |
|---|---|
| **Django REST Framework (DRF)** | Django'yu API sunucusu yapmanın standart yolu. Serializer + permission sistemi bu projeye birebir uyuyor. |
| **SimpleJWT** | Stateless JWT auth. React ↔ Django ayrı domainlerde olacağı için session cookie yerine JWT daha temiz. |
| **Vite + TypeScript** | CRA artık bakımda değil. Vite hızlı, Vercel ile sorunsuz. TS ile API tipleri güvenli. |
| **Tailwind CSS v4** | Renkli/oyuncu tasarımı hızlı kurmak için. v4 CSS-first: tema tokenları `@theme` bloğunda, `tailwind.config.js` yok. |
| **TanStack Query** | Anket listesi/detayı cache'leme, oy sonrası otomatik yenileme. Manuel `useEffect` fetch'inden çok daha az hata. |
| **React Router** | Sayfa yönlendirme. |
| **React Hook Form + Zod** | Form doğrulama (2–5 seçenek kuralı, e-posta formatı). |
| **Motion** (eski adıyla Framer Motion) | Oy verince dolan çubuk, uçuşan kelebek animasyonları. |
| **requirements.txt** (pinlenmiş) | Python bağımlılıkları. Poetry/uv daha zarif olurdu ama **Vercel Python runtime `requirements.txt` okuyor**; pyproject sadece araç yapılandırması tutuyor. |
| **django-cors-headers** | React ayrı origin'den gelecek, CORS şart. |
| **django-environ** | `.env` yönetimi. |
| **WhiteNoise** | Django admin'in statik dosyaları için. |
| **Sentry** (opsiyonel) | Hata takibi, ücretsiz katman yeterli. |
| **pytest + pytest-django** | Test. |
| **Ruff + Black / oxlint + Prettier** | Lint & format. oxlint, güncel Vite şablonunun varsayılanı (ESLint yerine) ve belirgin biçimde hızlı. |

### 2.3 ⚠️ Deployment Konusunda Önemli Uyarı

**Vercel serverless (Python runtime) üzerinde Django çalışır, ancak kısıtları var:**

- Soğuk başlangıç (cold start) gecikmesi: ilk istek 2–5 sn sürebilir.
- Kalıcı DB bağlantısı yok → her istekte yeni bağlantı. **Supabase Connection Pooler
  (port `6543`, transaction mode) kullanmak zorunlu**, doğrudan `5432` değil.
- Uzun süren görevler, Celery, WebSocket **çalışmaz**.
- Statik/medya dosyaları için ek yapılandırma gerekir (v1'de medya yok, sorun değil).
- Fonksiyon boyutu limiti var ama Django + DRF rahat sığar.

**Karar:** Frontend kesinlikle Vercel. Backend için iki seçenek:

- **A (istenen):** Django'yu Vercel'de serverless olarak yayınla — `vercel.json` + `api/index.py`
  WSGI handler ile. v1 trafiği için yeterli, ücretsiz.
- **B (yedek):** Django'yu **Railway / Render / Fly.io** üzerinde uzun ömürlü bir container
  olarak yayınla, frontend Vercel'de kalsın. Cold start yok, DB pooling normal.

> Plan **A** ile ilerliyoruz (Faz 6). Cold start rahatsız edici olursa B'ye geçiş
> tek bir `Dockerfile` + env değişkeni taşıma işi; uygulama kodu değişmiyor.

### 2.4 Auth Kararı: Django Auth vs Supabase Auth

Supabase'in kendi Auth servisi var, ama **Django'nun kendi auth'unu kullanıyoruz.** Neden:

- İki ayrı kimlik kaynağı = sürekli senkronizasyon derdi.
- Django `AbstractUser`'ı `display_name` ile genişletmek çok kolay.
- Anket sahipliği ve permission'lar zaten Django tarafında.

**Supabase burada sadece "yönetilen PostgreSQL" olarak kullanılıyor.** RLS (Row Level Security)
devre dışı kalır, çünkü tüm erişim Django üzerinden tek bir bağlantıyla yapılır.
Tarayıcı doğrudan Supabase'e bağlanmaz.

---

## 3. Mimari

```
┌────────────────────────┐        ┌─────────────────────────┐
│  React (Vite + TS)     │        │  Django + DRF           │
│  Vercel                │ HTTPS  │  Vercel Serverless      │
│                        │ ─────► │  /api/v1/*              │
│  - TanStack Query      │  JWT   │  - SimpleJWT            │
│  - Tailwind            │ ◄───── │  - DRF ViewSets         │
│  - Framer Motion       │  JSON  │  - CORS                 │
└────────────────────────┘        └───────────┬─────────────┘
                                              │ psycopg
                                              │ (pooler :6543)
                                  ┌───────────▼─────────────┐
                                  │  Supabase PostgreSQL    │
                                  └─────────────────────────┘
```

### 3.1 Repo Yapısı (monorepo)

```
whatIsTheNext/
├── PROJE_PLANI.md
├── README.md
├── .gitignore
├── .gitattributes
├── backend/
│   ├── api/
│   │   └── index.py            # Vercel WSGI entry point        (Faz 6)
│   ├── config/                 # Django project
│   │   ├── settings/           # base.py / dev.py / prod.py     (Faz 1)
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── accounts/               # User modeli + auth endpointleri
│   ├── polls/                  # Poll, Option, Vote
│   ├── tests/
│   ├── manage.py
│   ├── requirements.txt        # uretim bagimliliklari (Vercel bunu okur)
│   ├── requirements-dev.txt    # + pytest, ruff, black
│   ├── pyproject.toml          # ruff / black / pytest yapilandirmasi
│   ├── vercel.json                                              # (Faz 6)
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/                # axios client + endpoint fonksiyonları
    │   ├── components/         # PollCard, OptionBar, BugMascot, ...
    │   ├── features/
    │   │   ├── auth/
    │   │   └── polls/
    │   ├── hooks/
    │   ├── pages/
    │   ├── styles/             # theme.css (@theme tokenlari)
    │   ├── types/
    │   └── main.tsx
    ├── public/
    ├── index.html
    ├── vite.config.ts
    ├── .oxlintrc.json
    ├── .prettierrc.json
    ├── package.json
    └── .env.example
```

---

## 4. Veri Modeli

### 4.1 `accounts.User` (AbstractUser'dan türetilmiş)

| Alan | Tip | Not |
|---|---|---|
| `id` | UUID | PK |
| `email` | EmailField | **unique**, giriş alanı (`USERNAME_FIELD`) |
| `display_name` | CharField(32) | **unique**, anketlerin üstünde görünür |
| `password` | CharField | Django hash (PBKDF2) |
| `is_active` | Bool | |
| `date_joined` | DateTime | |

`username` alanı kaldırılır: `USERNAME_FIELD = "email"`, `REQUIRED_FIELDS = ["display_name"]`.

> ⚠️ Custom user modeli **ilk migration'dan önce** tanımlanmalı. Sonradan değiştirmek çok acı verici.
> Bu yüzden Faz 1'de yapılıyor.

### 4.2 `polls.Poll`

| Alan | Tip | Not |
|---|---|---|
| `id` | UUID | PK |
| `question` | CharField(200) | Anket sorusu |
| `description` | TextField | Opsiyonel, max 500 |
| `author` | FK → User | `on_delete=CASCADE` |
| `status` | Choice | `open` / `closed` |
| `created_at` | DateTime | |
| `closes_at` | DateTime | Nullable, varsayılan +7 gün |
| `allow_guest_votes` | Bool | Varsayılan `True` (Faz 7) |

Seçenek sayısı kuralı (2 ≤ n ≤ 5) serializer seviyesinde doğrulanır.

### 4.3 `polls.Option`

| Alan | Tip | Not |
|---|---|---|
| `id` | UUID | PK |
| `poll` | FK → Poll | `related_name="options"`, CASCADE |
| `text` | CharField(120) | |
| `order` | SmallInt | 0–4, görüntü sırası |

`unique_together = ("poll", "order")`

### 4.4 `polls.Vote`

| Alan | Tip | Not |
|---|---|---|
| `id` | UUID | PK |
| `poll` | FK → Poll | CASCADE (sayım kolaylığı için denormalize) |
| `option` | FK → Option | CASCADE |
| `user` | FK → User | **nullable** (ziyaretçi oyunda boş) |
| `voter_token` | UUIDField | **nullable** (üye oyunda boş) |
| `ip_hash` | CharField(64) | SHA-256(ip + salt), rate limit için |
| `created_at` | DateTime | |

**Kısıtlar:**

```python
constraints = [
    UniqueConstraint(fields=["poll", "user"],
                     condition=Q(user__isnull=False),
                     name="uniq_vote_per_user"),
    UniqueConstraint(fields=["poll", "voter_token"],
                     condition=Q(voter_token__isnull=False),
                     name="uniq_vote_per_token"),
    CheckConstraint(check=Q(user__isnull=False) | Q(voter_token__isnull=False),
                    name="vote_has_identity"),
]
```

Sonuç sayımı: `Option.objects.annotate(vote_count=Count("vote"))` — v1 için yeterli.
Trafik artarsa `Option.cached_count` denormalize alanı + `F()` increment'e geçilir.

---

## 5. API Sözleşmesi

Taban yol: `/api/v1/`

### 5.1 Auth

| Method | Endpoint | Yetki | Açıklama |
|---|---|---|---|
| `POST` | `/auth/register/` | Herkes | `{email, display_name, password}` → 201 + tokenlar |
| `POST` | `/auth/login/` | Herkes | `{email, password}` → `{access, refresh}` |
| `POST` | `/auth/refresh/` | Herkes | `{refresh}` → `{access}` |
| `POST` | `/auth/logout/` | Üye | Refresh token'ı blacklist'e alır |
| `GET` | `/auth/me/` | Üye | Mevcut kullanıcı profili |
| `PATCH` | `/auth/me/` | Üye | `display_name` güncelleme |

### 5.2 Anketler

| Method | Endpoint | Yetki | Açıklama |
|---|---|---|---|
| `GET` | `/polls/` | Herkes | Liste. `?sort=new\|hot\|top&status=open\|closed&page=` |
| `POST` | `/polls/` | **Üye** | `{question, description?, options: [...2-5], closes_at?}` |
| `GET` | `/polls/{id}/` | Herkes | Detay + seçenekler + oy sayıları + `my_vote` |
| `PATCH` | `/polls/{id}/` | Sahibi | Sadece `status: closed` yapmak için |
| `DELETE` | `/polls/{id}/` | Sahibi | Anketi sil |
| `POST` | `/polls/{id}/vote/` | Herkes | `{option_id}` → 201. Mükerrerse 409. |
| `GET` | `/polls/mine/` | Üye | Kullanıcının kendi anketleri |

### 5.3 Hata Formatı

```json
{ "error": { "code": "ALREADY_VOTED", "message": "Bu ankete zaten oy verdiniz." } }
```

Kodlar: `VALIDATION_ERROR`, `ALREADY_VOTED`, `POLL_CLOSED`, `NOT_AUTHENTICATED`,
`PERMISSION_DENIED`, `NOT_FOUND`, `RATE_LIMITED`.

### 5.4 Örnek: Anket Detay Yanıtı

```json
{
  "id": "8f3a...",
  "question": "Akşam ne yesek?",
  "description": null,
  "author": { "display_name": "kelebek_avcisi" },
  "status": "open",
  "created_at": "2026-09-22T18:03:00Z",
  "closes_at": "2026-09-29T18:03:00Z",
  "total_votes": 47,
  "my_vote": "c1d2...",
  "options": [
    { "id": "a1b2...", "text": "Pizza",  "order": 0, "vote_count": 23, "percentage": 48.9 },
    { "id": "c1d2...", "text": "Mantı",  "order": 1, "vote_count": 19, "percentage": 40.4 },
    { "id": "e3f4...", "text": "Salata", "order": 2, "vote_count":  5, "percentage": 10.7 }
  ]
}
```

---

## 6. Tasarım Sistemi — "Bahçe Teması" 🌻

Aydınlık, renkli, oyuncu ama okunaklı. Metafor: **bir bahçe** — her anket bir çiçek,
her oy o çiçeği ziyaret eden bir böcek.

### 6.1 Renk Paleti

| Token | Hex | Kullanım |
|---|---|---|
| `garden-cream` | `#FFFDF7` | Sayfa arka planı (kırık beyaz, göz yormaz) |
| `garden-card` | `#FFFFFF` | Kart yüzeyleri |
| `leaf-500` | `#7CB342` | **Birincil** — butonlar, aktif durum |
| `leaf-600` | `#5A8A2E` | Beyaz metin gerektiğinde koyu yeşil (kontrast) |
| `leaf-100` | `#E8F5E0` | Yumuşak yeşil zemin, hover |
| `ladybug-500` | `#E4572E` | **Vurgu** — kazanan seçenek, uyarı, uğur böceği |
| `honey-400` | `#FFC94A` | İkincil vurgu — rozet, yıldız, arı |
| `sky-300` | `#7DD3FC` | Bilgi tonu, link, kelebek kanadı |
| `lavender-400` | `#A78BFA` | Dekoratif, grafik varyansı |
| `petal-200` | `#FBCFE8` | Yumuşak pembe, dekoratif çiçek |
| `bark-800` | `#3F3A36` | Ana metin (saf siyah değil, sıcak koyu kahve) |
| `bark-400` | `#8A8179` | İkincil metin, placeholder |

Tokenlar Tailwind v4'ün `@theme` bloğunda tanımlanır (`--color-leaf-500: #7CB342;` →
`bg-leaf-500`, `text-leaf-500` sınıfları otomatik üretilir).

Seçenek çubukları paletten sırayla renklenir: `leaf → honey → sky → lavender → petal`.

### 6.2 Tipografi

- **Başlıklar:** `Baloo 2` veya `Fredoka` — yuvarlak, sevimli, Türkçe karakter desteği tam.
- **Gövde:** `Inter` veya `Nunito` — okunaklı.
- Google Fonts üzerinden, `font-display: swap`.

### 6.3 Şekil ve Doku

- Köşe yuvarlaklığı: kartlarda `rounded-2xl` (16px), butonlarda `rounded-full`.
- Gölge yumuşak ve renkli: `0 4px 20px rgba(124,179,66,.12)`. Sert siyah gölge yok.
- Arka plan: çok soluk (~%6 opaklık) tekrarlayan yaprak/çiçek SVG deseni.

### 6.4 Maskot ve İllüstrasyon

Tüm illüstrasyonlar **inline SVG** — telif sorunu yok, tema rengiyle boyanır, hafif.

| Öğe | Nerede |
|---|---|
| 🐞 Uğur böceği | Logo yanında; oy verilince ekranda yürüyerek geçer |
| 🦋 Kelebek | Boş durum ekranları, sayfa geçişleri |
| 🐝 Arı | Yükleniyor animasyonu (çiçeğin etrafında döner) |
| 🌼 Papatya | Anket kartı köşe süsü |
| 🌱 Filiz | "Henüz oy yok" boş durumu |

### 6.5 Erişilebilirlik

- Tüm metin/zemin kombinasyonları **WCAG AA (4.5:1)** sağlamalı.
  `leaf-500` üzerine beyaz metin yetersiz kalırsa `leaf-600` kullanılır.
- Renk tek başına bilgi taşımaz: kazanan seçenek renk + 🏆 ikonu + kalın metinle işaretlenir.
- `prefers-reduced-motion` desteklenir — böcek animasyonları kapanır.
- Tüm interaktif öğelerde görünür `focus-visible` halkası.
- Form alanlarında `<label>`, hata mesajlarında `aria-live="polite"`.

### 6.6 Ekranlar

1. **Ana Sayfa** — Hero (bahçe illüstrasyonu + "Karar veremiyor musun?") + anket akışı + sıralama sekmeleri
2. **Anket Detayı** — Soru, seçenek çubukları, oy butonu, sonuç görünümü
3. **Anket Oluştur** — Üyelere özel; dinamik seçenek satırları (2 sabit + 3 eklenebilir)
4. **Giriş** — E-posta + şifre
5. **Kayıt** — E-posta + takma ad + şifre (+ takma ad müsaitlik kontrolü)
6. **Profil** — Takma ad düzenleme, kendi anketleri listesi
7. **404 / Boş durum** — Kaybolmuş kelebek illüstrasyonu

---

## 7. Fazlar

Her faz kendi dalında geliştirilir, `main`'e merge edilir ve sonunda çalışan bir şey bırakır.

---

### Faz 0 — Temel Kurulum · `chore/phase-0-scaffold`

**Çıktı:** Boş ama çalışan monorepo, git geçmişi başlamış.

- [x] `git init`, `main` dalı
- [x] `.gitignore` (Python, Node, `.env`, `.vercel`, `__pycache__`, `node_modules`)
- [x] `.gitattributes` (CRLF/LF normalizasyonu — Windows'ta şart)
- [x] `PROJE_PLANI.md` + `README.md`
- [x] `backend/` — Django 5.2 projesi (`config`) + boş `accounts` ve `polls` app'leri
- [x] `backend/requirements.txt` (pinli) + `requirements-dev.txt` + `pyproject.toml` (ruff/black/pytest)
- [x] `frontend/` — Vite 8 + React 19 + TypeScript
- [x] Ruff + Black (backend), oxlint + Prettier (frontend)
- [x] `.env.example` dosyaları

**Gerçekleşen commitler:**

```
docs: add project plan for what is the next
chore: add gitignore and readme
chore(backend): scaffold django project with accounts and polls apps
chore(frontend): scaffold vite react typescript app
chore: normalize line endings and align plan with actual setup
```

> Not: Faz 0 depoyu kurduğu için doğrudan `main` üzerinde yapıldı.
> Faz 1'den itibaren her faz kendi dalında geliştirilir (§9.1).

---

### Faz 1 — Veritabanı ve Modeller · `feat/phase-1-models`

**Çıktı:** Supabase'e bağlı, migration'ları uygulanmış şema. Admin panelinden veri girilebiliyor.

- [x] `django-environ` ile `DATABASE_URL` okunması (boşsa yerel sqlite'a düşer)
- [x] `settings/base.py`, `dev.py`, `prod.py` ayrımı
- [x] `accounts.User` custom modeli (UUID PK, email login, `display_name`)
- [x] `polls.Poll`, `polls.Option`, `polls.Vote` + kısıtlar
- [x] İlk migration + `migrate`
- [x] Django admin kayıtları (`list_display`, `search_fields`, inline seçenekler)
- [x] Model seviyesi testler (14 test)
- [ ] **Supabase projesi aç, connection string al (pooler, port 6543)** → senin yapman gerekiyor
- [ ] Süper kullanıcı oluşturma (`python manage.py createsuperuser`) → şifre gerektiği için sende

**Gerçekleşen commitler:**

```
feat(backend): split settings and read config from environment
feat(accounts): add custom user model with email login and display name
feat(polls): add poll, option and vote models with uniqueness constraints
test(polls): cover model level voting and uniqueness rules
```

⚠️ **Dikkat:** `AUTH_USER_MODEL` ayarı ilk `makemigrations` öncesinde yapıldı.

> Supabase bağlanana kadar proje yerel sqlite ile çalışır. `DATABASE_URL` dolduğunda
> aynı migration'lar PostgreSQL'e uygulanır; kod değişmez.

---

### Faz 2 — Kimlik Doğrulama API'si · `feat/phase-2-auth`

**Çıktı:** Kayıt / giriş / token yenileme / profil endpoint'leri çalışıyor.

- [ ] DRF + SimpleJWT kurulumu, `REST_FRAMEWORK` ayarları
- [ ] `RegisterSerializer` — e-posta benzersizliği, şifre gücü (`validate_password`),
      `display_name` benzersizliği ve formatı (3–32 karakter; harf, rakam, `_`)
- [ ] `POST /auth/register|login|refresh|logout`
- [ ] `GET|PATCH /auth/me/`
- [ ] `django-cors-headers` yapılandırması
- [ ] Throttle: register/login için `AnonRateThrottle`
- [ ] Testler: kayıt, mükerrer e-posta, hatalı giriş, token yenileme

**Commitler:**

```
feat(backend): add drf and simplejwt authentication setup
feat(accounts): add register and login endpoints with validation
feat(accounts): add profile read and update endpoints
feat(backend): configure cors and rate limiting
test(accounts): cover registration and authentication flows
```

---

### Faz 3 — Anket ve Oylama API'si · `feat/phase-3-polls-api`

**Çıktı:** Backend tamamen bitmiş; httpie/Postman ile uçtan uca senaryo çalışıyor.

- [ ] `PollSerializer` — iç içe seçenekler, **2–5 seçenek doğrulaması**
- [ ] `PollViewSet` — liste (sayfalama, `new|hot|top` sıralama), detay, oluştur, kapat, sil
- [ ] `IsAuthenticatedOrReadOnly` + `IsOwnerOrReadOnly` permission sınıfları
- [ ] `POST /polls/{id}/vote/` — üye ve ziyaretçi yolları
- [ ] `voter_token` cookie middleware (yoksa üret; `HttpOnly`, `SameSite=None`, `Secure`)
- [ ] Mükerrer oy → `409 ALREADY_VOTED`; kapalı anket → `403 POLL_CLOSED`
- [ ] Oy sayımı `annotate(Count)` ile; `select_related` / `prefetch_related` optimizasyonu
- [ ] Özel exception handler (§5.3 hata formatı)
- [ ] Testler: 1 ve 6 seçenekli anket reddi, ziyaretçi oyu, çift oy, kapalı ankete oy,
      başkasının anketini silme denemesi

**Commitler:**

```
feat(polls): add poll serializers with 2-5 option validation
feat(polls): add poll list, detail and create endpoints
feat(polls): add vote endpoint for members and guests
feat(polls): add voter token middleware for guest vote deduplication
feat(polls): add owner-only close and delete permissions
feat(backend): add unified error response handler
test(polls): cover poll creation, voting and duplicate vote rules
```

---

### Faz 4 — Frontend İskeleti ve Tasarım Sistemi · `feat/phase-4-design-system`

**Çıktı:** Statik ama tema tam oturmuş arayüz; mock veriyle görünüyor.

- [ ] Tailwind v4 kurulumu (`@tailwindcss/vite`) + §6.1 palet tokenları `src/styles/theme.css`
      içindeki `@theme` bloğunda
- [ ] Google Fonts (Baloo 2 + Inter)
- [ ] SVG maskot bileşenleri: `<Ladybug/>`, `<Butterfly/>`, `<Bee/>`, `<Daisy/>`, `<Sprout/>`
- [ ] Ortak bileşenler: `Button`, `Input`, `Card`, `Badge`, `Spinner`, `EmptyState`, `Toast`
- [ ] `Layout` — bahçe desenli arka plan, header (logo + uğur böceği), footer
- [ ] React Router rotaları (tüm sayfalar iskelet halinde)
- [ ] `prefers-reduced-motion` ve focus ring desteği
- [ ] Kontrast oranlarının kontrolü

**Commitler:**

```
feat(frontend): add tailwind with garden theme color tokens
feat(frontend): add baloo and inter typography setup
feat(frontend): add svg mascot components for garden theme
feat(frontend): add shared ui component library
feat(frontend): add app layout with routing skeleton
style(frontend): add accessibility focus and reduced motion support
```

---

### Faz 5 — Frontend Entegrasyonu · `feat/phase-5-integration`

**Çıktı:** Lokalde tam çalışan uygulama.

- [ ] Axios client + `access` token interceptor + 401'de `refresh` retry
- [ ] TanStack Query kurulumu, query key stratejisi
- [ ] `AuthContext` — kullanıcı durumu, `login/register/logout`, token saklama
      (`access` bellekte, `refresh` `HttpOnly` cookie'de)
- [ ] **Giriş** ve **Kayıt** sayfaları (React Hook Form + Zod)
- [ ] **Ana sayfa** — anket akışı, sayfalama, sıralama sekmeleri
- [ ] **Anket detayı** — oy verme, animasyonlu sonuç çubukları, kazanan rozeti
- [ ] **Anket oluşturma** — dinamik seçenek satırları (min 2, max 5, ekle/sil butonları)
- [ ] **Profil** — takma ad düzenleme + kendi anketleri
- [ ] Optimistic update: oy basınca çubuk anında dolsun, hata olursa geri alınsın
- [ ] Yükleniyor / hata / boş durum ekranları (arı ve kelebek animasyonlu)
- [ ] 404 sayfası

**Commitler:**

```
feat(frontend): add api client with jwt refresh interceptor
feat(frontend): add auth context and protected routes
feat(frontend): add login and register pages with validation
feat(frontend): add poll feed with sorting and pagination
feat(frontend): add poll detail page with animated results
feat(frontend): add poll creation form with dynamic options
feat(frontend): add profile page with display name editing
feat(frontend): add optimistic voting updates
feat(frontend): add loading, empty and error states
```

---

### Faz 6 — Deployment · `chore/phase-6-deploy`

**Çıktı:** Canlıda çalışan uygulama.

- [ ] `backend/api/index.py` — Vercel WSGI handler
- [ ] `backend/vercel.json` — Python build + route yönlendirmesi
- [ ] `prod.py`: `DEBUG=False`, `ALLOWED_HOSTS`, `SECURE_SSL_REDIRECT`, HSTS,
      `CSRF_TRUSTED_ORIGINS`
- [ ] Supabase **pooler** connection string (`:6543`), `CONN_MAX_AGE=0`
      (serverless'ta Django tarafında bağlantı tutma kapalı olmalı)
- [ ] Vercel env değişkenleri (§8)
- [ ] Frontend Vercel'e deploy; `VITE_API_URL` prod backend'e işaret etsin
- [ ] CORS ve cookie ayarları prod domainlere göre (`SameSite=None; Secure`)
- [ ] Migration'ları elle çalıştır (serverless'ta otomatik migrate **yapma**)
- [ ] Duman testi: kayıt → anket aç → ziyaretçi oyu → sonuç

**Commitler:**

```
chore(backend): add vercel wsgi entry point and configuration
chore(backend): add production settings with security headers
chore(frontend): add vercel deployment configuration
docs: add deployment and environment variable guide
```

⚠️ Cold start rahatsız ederse backend'i Railway'e taşı (§2.3-B). Uygulama kodu değişmez.

---

### Faz 7 — Cila ve Sertleştirme · `feat/phase-7-polish`

**Çıktı:** Yayına hazır ürün.

- [ ] Rate limiting: IP başına oy ve anket oluşturma limitleri
- [ ] Anket başına "oy vermek için üyelik zorunlu" seçeneği (`allow_guest_votes`)
- [ ] Süresi dolan anketleri otomatik kapatma (Vercel Cron veya okuma anında lazy kapatma)
- [ ] Paylaşım: anket linki kopyalama + Open Graph meta etiketleri
- [ ] SEO: `react-helmet-async`, `sitemap.xml`, `robots.txt`
- [ ] Lighthouse: performans ve erişilebilirlik ≥ 90
- [ ] Mobil responsive gözden geçirme
- [ ] Sentry entegrasyonu
- [ ] `README.md` tamamlanması (kurulum, geliştirme, deploy adımları)

**Commitler:**

```
feat(polls): add per-poll member-only voting option
feat(polls): add automatic closing of expired polls
feat(frontend): add share link and open graph metadata
perf(frontend): optimize bundle size and lighthouse score
chore: add sentry error monitoring
docs: complete readme with setup and deployment instructions
```

---

### Faz 8 — Gelecek Fikirler (v2, opsiyonel)

Yorumlar · Anket kategorileri ve etiketler · Arama · "Haftanın anketi" · Sosyal giriş ·
Kullanıcı profil sayfaları · Anket görselleri · Bildirimler · Çoklu dil (TR/EN) ·
Karanlık tema (gece bahçesi 🌙) · Seçeneklere açıklama/görsel ekleme

---

## 8. Ortam Değişkenleri

### `backend/.env`

```bash
DJANGO_SECRET_KEY=
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgresql://postgres.xxxx:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
CORS_ALLOWED_ORIGINS=http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173
VOTER_TOKEN_SALT=
JWT_ACCESS_LIFETIME_MIN=15
JWT_REFRESH_LIFETIME_DAYS=7
SENTRY_DSN=
```

### `frontend/.env`

```bash
VITE_API_URL=http://localhost:8000/api/v1
```

> `.env` dosyaları **asla** commit edilmez; sadece `.env.example` versiyonlanır.
> Supabase şifresi ve `DJANGO_SECRET_KEY` Vercel'in env panelinden girilir.

---

## 9. Git Akışı

### 9.1 Dal Stratejisi

`main` her zaman deploy edilebilir durumda. Her faz için bir feature dalı:

```bash
git checkout -b feat/phase-3-polls-api
# ... çalış, küçük ve anlamlı commitler at ...
git checkout main
git merge --no-ff feat/phase-3-polls-api
git tag -a v0.3.0 -m "Faz 3: anket ve oylama api"
```

Faz sonunda `--no-ff` merge + sürüm etiketi → geçmiş okunabilir kalır.

### 9.2 Commit Formatı — Conventional Commits

```
<tip>(<kapsam>): <özet>
```

| Tip | Kullanım |
|---|---|
| `feat` | Yeni özellik |
| `fix` | Hata düzeltme |
| `chore` | Yapılandırma, bağımlılık, altyapı |
| `docs` | Dokümantasyon |
| `test` | Test ekleme/düzenleme |
| `refactor` | Davranış değişmeden kod düzenleme |
| `style` | Biçimlendirme, CSS |
| `perf` | Performans |

Kapsamlar: `backend`, `frontend`, `accounts`, `polls`, `ci`

**Kurallar:**

- Özet emir kipinde, küçük harf, sonda nokta yok, ≤ 72 karakter.
- Bir commit = bir mantıksal değişiklik. "wip", "fix2", "asdf" yok.
- Commit mesajları İngilizce (kod ve API İngilizce olduğu için tutarlı).

### 9.3 Sürüm Etiketleri

| Etiket | Faz |
|---|---|
| `v0.1.0` | Faz 1 — modeller |
| `v0.2.0` | Faz 2 — auth |
| `v0.3.0` | Faz 3 — anket API |
| `v0.4.0` | Faz 4 — tasarım sistemi |
| `v0.5.0` | Faz 5 — entegrasyon |
| `v1.0.0` | Faz 6 — canlı yayın |
| `v1.1.0` | Faz 7 — cila |

---

## 10. Test Stratejisi

| Katman | Araç | Kapsam |
|---|---|---|
| Backend birim | pytest + pytest-django | Model kısıtları, serializer doğrulamaları |
| Backend API | DRF `APIClient` | Tüm endpoint'ler, yetki matrisi, hata kodları |
| Frontend birim | Vitest + Testing Library | Form doğrulama, bileşen render |
| Uçtan uca (ops.) | Playwright | Kayıt → anket aç → oy ver → sonuç |

**Mutlaka test edilecek kritik senaryolar:**

1. 1 seçenekli anket → reddedilir
2. 6 seçenekli anket → reddedilir
3. Üye olmayan kullanıcı anket açamaz → 401
4. Üye olmayan kullanıcı oy verebilir → 201
5. Aynı kullanıcı iki kez oy veremez → 409
6. Aynı `voter_token` iki kez oy veremez → 409
7. Kapalı ankete oy → 403
8. Başkasının anketini silme → 403
9. Mükerrer e-posta ile kayıt → 400
10. Mükerrer `display_name` → 400

### 10.1 CI (opsiyonel, Faz 2'de eklenebilir)

`.github/workflows/ci.yml` — her push'ta: `ruff` + `black --check` + `pytest`,
`eslint` + `tsc --noEmit` + `vitest`.

---

## 11. Bilinen Riskler

| Risk | Etki | Azaltma |
|---|---|---|
| Vercel serverless cold start | İlk istek yavaş | Railway'e taşı (§2.3-B) |
| Supabase ücretsiz katman işlemsizlikte duraklar | Uygulama ölü görünür | Periyodik cron ping veya ücretli katman |
| Ziyaretçi oyu manipülasyonu | Sonuçlar güvenilmez | Rate limit + anket bazında üyelik zorunluluğu (Faz 7) |
| Custom user modelini geç tanımlama | Migration cehennemi | Faz 1'de, ilk migration öncesi tanımla |
| Serverless'ta DB bağlantı tükenmesi | 500 hataları | Pooler (`:6543`) + `CONN_MAX_AGE=0` |
| Cross-site cookie (`voter_token`) | Safari/Firefox engelleyebilir | Yedek: `localStorage` + istek başlığı ile gönder |

---

## 12. Başlangıç Komutları

Faz 0 tamamlandığı için artık depoyu klonlayıp doğrudan çalıştırabilirsin:

```bash
# --- Backend ---
cd backend
python -m venv .venv
source .venv/Scripts/activate        # PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
cp .env.example .env                 # icini doldur
python manage.py migrate
python manage.py runserver

# --- Frontend ---
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

Sonraki fazlarda eklenecek bağımlılıklar:

```bash
# Faz 4 — tasarim sistemi
npm install tailwindcss @tailwindcss/vite

# Faz 5 — entegrasyon
npm install @tanstack/react-query axios react-router-dom \
            react-hook-form zod @hookform/resolvers motion
```

---

*Son güncelleme: 2026-09-22*
