'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

function URLParamsReader({
  onUpdate,
}: {
  onUpdate: (showControls: boolean) => void;
}) {
  const searchParams = useSearchParams();
  const isDev = process.env.NEXT_PUBLIC_IS_DEV === 'true';
  const showControls = isDev && (searchParams?.has('controls') ?? false);
  useEffect(() => {
    onUpdate(showControls);
  }, [showControls, onUpdate]);

  return null;
}

export default URLParamsReader;
