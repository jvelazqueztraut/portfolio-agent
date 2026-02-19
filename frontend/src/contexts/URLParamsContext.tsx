'use client';

import { createContext, useContext, useState } from 'react';

const URLParamsContext = createContext<{
  showControls: boolean;
  setShowControls: (showControls: boolean) => void;
}>({
  showControls: false,
  setShowControls: () => {},
});

export function URLParamsProvider({ children }: { children: React.ReactNode }) {
  const [showControls, setShowControls] = useState(false);

  return (
    <URLParamsContext.Provider value={{ showControls, setShowControls }}>
      {children}
    </URLParamsContext.Provider>
  );
}

export function useURLParams() {
  return useContext(URLParamsContext);
}
