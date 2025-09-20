
import { Suspense } from 'react';
import { DashboardClientContent } from './components/dashboard-client-content';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-full"><p>Carregando painel...</p></div>}>
      <DashboardClientContent />
    </Suspense>
  );
}
