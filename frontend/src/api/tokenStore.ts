// Backend JWT'leri dogrudan JSON govdesinde doner (HttpOnly cookie degil,
// bkz. accounts/views.py). access token React disinda (axios interceptor'da)
// senkron okunabilmesi icin modul seviyesinde bir degiskende tutulur; sayfa
// yenilenince kaybolur ve refresh token ile sessizce yenilenir. refresh token
// localStorage'da kalir - bu XSS'e karsi HttpOnly cookie kadar guvenli degil,
// ama backend'i degistirmeden (Faz 2 zaten test edilip birlestirildi) en
// basit tutarli cozum bu. Ilerideki bir fazda backend cookie tabanli refresh'e
// tasinirsa burasi tek degisecek yer.

const REFRESH_TOKEN_KEY = 'witn_refresh_token';

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setTokens(tokens: { access: string; refresh?: string }): void {
  accessToken = tokens.access;
  if (tokens.refresh) {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
    } catch {
      // localStorage kapalıysa (gizli sekme vb.) sessizce yut; oturum sayfa
      // yenilenene kadar bellekte kalır.
    }
  }
}

export function clearTokens(): void {
  accessToken = null;
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // yok say
  }
}
