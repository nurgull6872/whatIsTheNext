"""Vercel serverless giris noktasi (§2.3, Faz 6).

Vercel'in @vercel/python calisma zamani bu dosyayi calistirip icindeki
WSGI uygulamasini kullanir. Django'nun kendi ürettiği config/wsgi.py'yi
degistirmeden, sadece burada yeniden disa aktariyoruz.

Yerel gelistirmede bu dosya hic calismaz; sadece Vercel'de devreye girer
(bkz. manage.py / config/wsgi.py yerel ve diger platformlar icin).
"""

import os
import sys
from pathlib import Path

# backend/api/index.py -> backend/
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.prod")

from django.core.wsgi import get_wsgi_application  # noqa: E402

app = get_wsgi_application()
