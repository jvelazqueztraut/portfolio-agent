import { useEffect, useRef, useState } from 'react';

import ResizeService from '@/services/resize.service';

const getOrientation = () => ResizeService.size?.isLandscape ?? false;

// Only set "setListeners" to true once per app
// (on the highest level component using it, usually the app or non-functionals containers)
const useOrientation = (setListeners = false) => {
  const [isLandscape, setIsLandscape] = useState(getOrientation());
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
      if (isRendered.current) setIsLandscape(getOrientation());
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

  return isLandscape;
};

export default useOrientation;
