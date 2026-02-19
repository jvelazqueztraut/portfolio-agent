import { useEffect, useRef, useState } from 'react';

import ResizeService from '@/services/resize.service';

const windowSize = () => ResizeService.size;

// Only set "setListeners" to true once per app
// (on the highest level component using it, usually the app or non-functionals containers)
const useWindowSize = (setListeners = false) => {
  const [size, setSize] = useState(windowSize());
  const [isMounted, setMounted] = useState<boolean>(false);
  const isRendered = useRef<boolean>(false);

  useEffect(() => {
    if (isMounted) {
      if (setListeners) ResizeService.addListeners();
      isRendered.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  useEffect(() => {
    const onResize = () => {
      if (isRendered.current) setSize(windowSize());
    };

    setMounted(true);
    ResizeService.add(onResize);

    return () => {
      ResizeService.remove(onResize);
      if (setListeners) ResizeService.removeListeners();

      setMounted(false);
      isRendered.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return size;
};

export default useWindowSize;
