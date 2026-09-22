import { NavLink } from 'react-router-dom';

import { Ladybug } from '../mascots';
import { cn } from '../../lib/cn';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-leaf-100 text-leaf-700'
      : 'text-bark-600 hover:bg-bark-800/5 hover:text-bark-800',
  );

// Buton gorunumlu link; <Button> bilesenini <NavLink> icine sarmiyoruz
// cunku bir <a> etiketinin icine <button> koymak gecersiz/erisilebilirlik
// dostu olmayan bir DOM iic ice gecmesi olur.
const ctaLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-full px-5 py-2 text-sm font-heading font-semibold transition-colors',
    isActive ? 'bg-leaf-100 text-leaf-700' : 'bg-leaf-700 text-white hover:opacity-90',
  );

export function Header() {
  // Faz 5'te AuthContext eklenince buradaki üye/ziyaretçi görünümü gerçek
  // oturum durumuna göre değişecek; şimdilik ziyaretçi görünümü sabit.
  const isAuthenticated = false;

  return (
    <header className="sticky top-0 z-40 border-b border-bark-200/60 bg-garden-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2">
          <Ladybug size={30} title="What Is The Next? logosu" />
          <span className="font-heading text-lg font-bold text-bark-800">What Is The Next?</span>
        </NavLink>

        <nav className="flex items-center gap-1" aria-label="Ana gezinme">
          <NavLink to="/" end className={navLinkClass}>
            Anketler
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/polls/new" className={navLinkClass}>
                Anket Oluştur
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                Profilim
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Giriş Yap
              </NavLink>
              <NavLink to="/register" className={ctaLinkClass}>
                Kayıt Ol
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
