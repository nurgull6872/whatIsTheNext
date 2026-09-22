import { Link } from 'react-router-dom';

import { Butterfly } from '../components/mascots';
import { EmptyState } from '../components/ui';

export function NotFoundPage() {
  return (
    <EmptyState
      icon={Butterfly}
      title="Bu sayfa kayıp bir kelebek gibi"
      description="Aradığın sayfa taşınmış ya da hiç var olmamış olabilir."
      action={
        <Link to="/" className="font-medium text-leaf-700 hover:underline">
          Ana sayfaya dön
        </Link>
      }
    />
  );
}
