import { Outlet } from 'react-router-dom';

import { Footer } from './Footer';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="garden-pattern-bg flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
