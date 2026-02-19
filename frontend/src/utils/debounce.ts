import { isBrowser } from './platform';

export const debounce = <T extends unknown[]>(
  fn: (...args: T) => void,
  delay = 250,
  hasLeadingCall = false,
  hasTrailingCall = false
) => {
  let timeout: number | null = null;

  const cancel = () => {
    if (isBrowser() && timeout !== null) window.clearTimeout(timeout);
    timeout = null;
  };

  const debounced = (...args: T) => {
    const shouldCallNow = hasLeadingCall && !timeout;
    const doLater = () => {
      timeout = null;

      if (!hasLeadingCall) fn(...args);
      if (hasTrailingCall) {
        timeout = !isBrowser()
          ? 0
          : window.setTimeout(() => {
              timeout = null;
              fn(...args);
            }, delay);
      }
    };

    if (isBrowser() && timeout !== null) window.clearTimeout(timeout);
    timeout = !isBrowser() ? 0 : window.setTimeout(doLater, delay);

    if (shouldCallNow) fn(...args);
  };

  debounced.cancel = cancel;
  return debounced;
};
