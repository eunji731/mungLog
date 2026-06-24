'use client';

import dynamic from 'next/dynamic';

const PawCareApp = dynamic(() => import('./PawCareApp'), { ssr: false });

export default function PawCareClient() {
  return <PawCareApp />;
}
