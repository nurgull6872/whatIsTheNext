# Deployment Rehberi (Faz 6)

Bu adımlar bir Vercel **hesabı** gerektirdiği için senin tarafından, tarayıcıda
yapılmalı — ben CLI'den oturum açamıyorum. Aşağıda sırayla ne yapman gerektiği var.

Backend ve frontend **iki ayrı Vercel projesi** olarak deploy edilir (mimari §3).

---

## 0) Ön koşul

- <https://vercel.com> üzerinde hesap aç (GitHub ile giriş yapmak en kolayı —
  repo'yu otomatik görür).
- Bu repo zaten GitHub'da: `nurgull6872/whatIsTheNext`.

---

## 1) Backend'i deploy et

1. Vercel dashboard → **Add New → Project**
2. `whatIsTheNext` reposunu seç (henüz görünmüyorsa **Import Git Repository**
   altından GitHub hesabını bağla)
3. **Configure Project** ekranında:
   - **Project Name:** `whatisthenext-api` (istediğin bir isim, URL'in parçası olacak)
   - **Root Directory:** `backend` ← **çok önemli**, `Edit` butonuyla seç
   - **Framework Preset:** Other
4. **Environment Variables** bölümüne şunları tek tek ekle (her biri "Production,
   Preview, Development" hepsinde işaretli kalsın):

   | Değişken | Değer |
   |---|---|
   | `DJANGO_SETTINGS_MODULE` | `config.settings.prod` |
   | `DJANGO_SECRET_KEY` | Aşağıdaki komutla üret |
   | `DJANGO_ALLOWED_HOSTS` | Şimdilik `.vercel.app` yaz, **adım 3'te** gerçek adresle değiştireceğiz |
   | `DATABASE_URL` | `backend/.env` dosyandaki ile **aynı** Supabase pooler adresi |
   | `VOTER_TOKEN_SALT` | `backend/.env` dosyandaki ile aynı değer |
   | `CORS_ALLOWED_ORIGINS` | Şimdilik boş bırak, **adım 3'te** dolduracağız |
   | `CSRF_TRUSTED_ORIGINS` | Şimdilik boş bırak, **adım 3'te** dolduracağız |
   | `JWT_ACCESS_LIFETIME_MIN` | `15` |
   | `JWT_REFRESH_LIFETIME_DAYS` | `7` |

   Yeni `DJANGO_SECRET_KEY` üretmek için kendi bilgisayarında:
   ```powershell
   cd backend
   .venv\Scripts\Activate.ps1
   python -c "from django.core.management.utils import get_random_secret_key as k; print(k())"
   ```
   (Yerel `.env`'deki ile aynısını kullanmaman, prod'a özel yeni bir tane
   üretmen daha güvenli.)

5. **Deploy** butonuna bas. Bitince Vercel sana bir adres verir, örn.
   `https://whatisthenext-api.vercel.app`. **Bu adresi bir yere not al.**

6. Adresi doğrula: tarayıcıda `https://whatisthenext-api.vercel.app/api/v1/polls/`
   aç. JSON dönmeli (`{"count": ..., "results": [...]}`). 500 hatası alırsan
   Vercel dashboard → proje → **Deployments** → son deployment → **Logs**'a bak,
   bana o hatayı gönder.

---

## 2) Frontend'i deploy et

1. Vercel dashboard → **Add New → Project**
2. Aynı `whatIsTheNext` reposunu tekrar seç
3. **Configure Project**:
   - **Project Name:** `whatisthenext` (ya da istediğin isim)
   - **Root Directory:** `frontend` ← önemli
   - **Framework Preset:** Vite (otomatik algılanır)
4. **Environment Variables**:

   | Değişken | Değer |
   |---|---|
   | `VITE_API_URL` | `https://whatisthenext-api.vercel.app/api/v1` (adım 1.5'teki adresin + `/api/v1`) |

5. **Deploy**. Bitince örn. `https://whatisthenext.vercel.app` adresini verir.
   **Bu adresi de not al.**

---

## 3) Backend'e frontend'in adresini tanıt

Frontend'in gerçek adresi olmadan backend CORS isteklerini reddeder — bu adım
şart.

1. Vercel dashboard → `whatisthenext-api` projesi → **Settings → Environment Variables**
2. Şunları güncelle (adım 1'de boş bıraktıkların):
   - `DJANGO_ALLOWED_HOSTS` → `whatisthenext-api.vercel.app` (kendi gerçek adresin, `https://` **olmadan**)
   - `CORS_ALLOWED_ORIGINS` → `https://whatisthenext.vercel.app` (frontend adresin, `https://` **ile**)
   - `CSRF_TRUSTED_ORIGINS` → `https://whatisthenext.vercel.app` (aynısı)
3. **Deployments** sekmesi → son deployment → **⋯ → Redeploy** (env değişkenleri
   sadece yeni bir deployment'ta devreye girer)

---

## 4) Veritabanı migration'ları

Migration'lar zaten senin yerel makinenden aynı Supabase'e uygulanmış durumda
(Faz 1'den beri). Yeni bir migration eklemedikçe burada ekstra bir şey yapmana
gerek yok. İleride model değiştirip migration eklersen:

```powershell
cd backend
.venv\Scripts\Activate.ps1
python manage.py migrate
```

yeterli — Vercel'e deploy **otomatik migrate çalıştırmaz** (bilerek; §7.2, kod
riskli).

---

## 5) Duman testi

Frontend adresini aç (`https://whatisthenext.vercel.app`) ve sırayla dene:

1. Kayıt ol
2. Anket oluştur
3. Başka bir tarayıcıda (ya da gizli sekmede) siteye gir, ziyaretçi olarak oy ver
4. Anketi kapat, sil

Bir adımda hata alırsan ekran görüntüsü veya tarayıcı konsolundaki hatayı
(F12 → Console) paylaş.

---

## Sorun giderme

| Belirti | Olası sebep |
|---|---|
| Backend 500 veriyor | Vercel logs'a bak; genelde eksik/yanlış env değişkeni |
| Frontend'den istek atınca CORS hatası | Adım 3'ü atlamış/yanlış yazmış olabilirsin |
| Giriş yapınca "Network Error" | `VITE_API_URL` yanlış ya da backend henüz deploy olmamış |
| Admin panelinde stil bozuk | Bilinen, zararsız kozmetik sorun (§Faz 6 notu) — ürünün asıl arayüzü React, admin sadece senin yönetim panelin |
| Cold start (ilk istek 2-5 sn yavaş) | Vercel serverless'in doğası; rahatsız ederse §2.3'teki Railway alternatifine geçilebilir, kod değişmez |
