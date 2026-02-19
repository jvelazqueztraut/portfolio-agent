let alreadyTested = false;
let passiveSupported = false;

/**
 * Returns if passive event are supported
 *
 * @returns {Boolean} supported
 */
const isSupported = () => {
  if (alreadyTested) {
    return passiveSupported;
  }
  alreadyTested = true;

  let opts;

  // Test via a getter in the options object to see if the passive property is accessed
  const noop = () => {};
  try {
    opts = Object.defineProperty({}, 'passive', {
      get: () => {
        passiveSupported = true;
        return passiveSupported;
      },
    });
    window.addEventListener('test', noop, opts);
  } catch {
    return passiveSupported;
  }
  window.removeEventListener('test', noop, opts);
  return passiveSupported;
};

/**
 * Passive event polyfill
 *
 * @returns {Object|Boolean} Passive event setup if is supported
 */
const passiveEvent = isSupported() ? { passive: true } : false;

export default passiveEvent;
