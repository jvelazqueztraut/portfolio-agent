import { UAParser } from 'ua-parser-js';

interface Browser {
  os: string;
  browser: string;
  recommendedMinVersion: number;
  minVersion?: number;
}

export const ALLOWED_BROWSERS: Record<
  'desktop' | 'tablet' | 'mobile',
  Browser[]
> = {
  desktop: [
    { os: '', browser: 'Firefox', recommendedMinVersion: 89 },
    { os: '', browser: 'Safari', recommendedMinVersion: 12, minVersion: 10 },
    { os: '', browser: 'Edge', recommendedMinVersion: 90 },
    { os: '', browser: 'Chrome', recommendedMinVersion: 90 },
  ],
  tablet: [
    { os: 'Android', browser: 'Chrome', recommendedMinVersion: 0 },
    { os: 'iOS', browser: 'Safari', recommendedMinVersion: 0 },
    { os: 'Mac OS', browser: 'Safari', recommendedMinVersion: 0 },
  ],
  mobile: [
    { os: 'Android', browser: 'Chrome', recommendedMinVersion: 0 },
    { os: 'iOS', browser: 'Safari', recommendedMinVersion: 0 },
    { os: 'Mac OS', browser: 'Safari', recommendedMinVersion: 0 },
  ],
};

export const isBrowser = () => typeof window !== 'undefined';
export const UA = new UAParser();
const { name, version } = UA.getBrowser();
export const { device, os } = UA.getResult();
const getUA = () =>
  isBrowser() ? navigator.userAgent || navigator.vendor : '';

export const isTouchDevice = () =>
  isBrowser() &&
  ('ontouchstart' in window ||
    'ontouchstart' in document.documentElement ||
    navigator.maxTouchPoints > 0 ||
    ((navigator as unknown as { MaxTouchPoints?: number }).MaxTouchPoints ?? 0) > 0 ||
    ((navigator as unknown as { msMaxTouchPoints?: number }).msMaxTouchPoints ?? 0) > 0);

const UNDETECTED_TABLETS = [
  { name: 'SHT-W09' }, // Huawei MediaPad M5
];
const LOW_PERFORMANCE_TABLETS = [
  { name: 'SM-T825' }, // Galaxy Tab S3
];

const isUndetectedTablets = () =>
  !!UNDETECTED_TABLETS.find(item => getUA().includes(item.name));

// Browsers
export const isSafari = () =>
  isBrowser() && name && name.toLowerCase().indexOf('safari') > -1;
export const isOpera = () =>
  isBrowser() && name && name.toLowerCase().indexOf('opera') > -1;
export const isFirefox = () =>
  isBrowser() && name && name.toLowerCase().indexOf('firefox') > -1;
export const isIE = () => isBrowser() && name && name.indexOf('IE') > -1;
export const isEdge = () =>
  isBrowser() && ((name && name.indexOf('Edge') > -1) || /.*EdgA*/.test(getUA()));
export const isChrome = () => isBrowser() && name && name.indexOf('Chrome') > -1;
export const isFacebook = () =>
  isBrowser() && (getUA().indexOf('FBAN') > -1 || getUA().indexOf('FBAV') > -1);
export const isInstagram = () =>
  isBrowser() && getUA().indexOf('Instagram') > -1;
export const isTwitter = () => isBrowser() && getUA().indexOf('Twitter') > -1;
export const isWeChat = () =>
  isBrowser() &&
  (getUA()?.indexOf('WeChat') > -1 ||
    getUA()?.indexOf('Weixin') > -1 ||
    getUA()?.indexOf('MicroMessenger') > -1 ||
    (name && name.toLowerCase().indexOf('wechat') > -1));

export const isIOS = () => os.name === 'iOS';
export const isAndroid = () => os.name === 'Android';
export const isHarmony = () =>
  os?.name?.includes('Harmony') ||
  device?.vendor === 'Huawei' ||
  getUA()?.indexOf('Harmony') > -1 ||
  getUA()?.indexOf('Huawei') > -1 ||
  getUA()?.indexOf('HUAWEI') > -1;
export const isHarmony5OrHigher = () =>
  isHarmony() &&
  (getUA().indexOf('OpenHarmony 5.') > -1 ||
    (os?.name === 'OpenHarmony' && os?.version && parseFloat(os.version) >= 5));
// As of Safari iOS 13, iPads and iPhones return UA strings identical to Mac OS, instead of iOS
export const isRecentIPadSafari = () =>
  isTouchDevice() && isSafari() && !isIOS() && window.devicePixelRatio === 2;
export const isRecentIPhoneSafari = () =>
  isTouchDevice() && isSafari() && !isIOS() && window.devicePixelRatio === 3;
export const isMobile = () =>
  device.type === 'mobile' || isRecentIPhoneSafari();
export const isTablet = () =>
  device.type === 'tablet' || isRecentIPadSafari() || isUndetectedTablets();
export const isAppleTablet = () =>
  (isTablet() && isIOS()) || isRecentIPadSafari();
export const isAppleMobile = () =>
  (isMobile() && isIOS()) || isRecentIPhoneSafari();
export const isDesktop = () => !isMobile() && !isTablet();
export const isRecentOS = () =>
  (isAndroid() && os.version && parseFloat(os.version) >= 9) ||
  (isIOS() && os.version && parseFloat(os.version) >= 13) ||
  isRecentIPadSafari();

export const isSocialBrowser = () =>
  isFacebook() || isInstagram() || isTwitter() || isWeChat();

export const isStorybook = () => isBrowser() && !!process.env.IS_STORYBOOK;
// https://dev.to/ag-grid/react-18-avoiding-use-effect-getting-called-twice-4i9e
export const shouldUseUnmountCheck = () =>
  process.env.NODE_ENV !== 'production' && !isStorybook();

export const isSupportedBrowser = () => {
  let isSupported = false;
  let fromSocial = false;
  let needsUpgrade = false;

  if (!isBrowser() || !UA) {
    return { isSupported, fromSocial, needsUpgrade };
  }

  const allowedBrowsers =
    ALLOWED_BROWSERS[
      isDesktop() ? 'desktop' : isTablet() ? 'tablet' : 'mobile'
    ];

  const supportedBrowser = allowedBrowsers.find(
    item => name && name.match(item.browser) && (item.os ? item.os === os.name : true)
  );

  if (supportedBrowser) {
    isSupported = true;
  }

  // If the browser version is slighlty outdated, accept it but warn the user
  if (
    supportedBrowser &&
    version &&
    parseFloat(version) < supportedBrowser.recommendedMinVersion
  ) {
    needsUpgrade = true;
  }

  // If the browser is too old, refuse it
  if (
    supportedBrowser &&
    supportedBrowser.minVersion &&
    version &&
    parseFloat(version) < supportedBrowser.minVersion
  ) {
    needsUpgrade = true;
    isSupported = false;
  }

  // If this is a social browser, refuse it
  if (isSocialBrowser()) {
    needsUpgrade = false;
    fromSocial = true;
    isSupported = false;
  }

  return { isSupported, fromSocial, needsUpgrade };
};

export const hasWebGl = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!(isBrowser() && gl && gl instanceof WebGLRenderingContext);
  } catch {
    return null;
  }
};

export const isLandscape = () =>
  isBrowser()
    ? isDesktop()
      ? window.innerWidth > window.innerHeight
      : Math.abs(
          (window.screen.orientation?.angle ?? window.orientation) % 180
        ) !== 0
    : true;

export const isInputFocused = () =>
  isBrowser() && document.activeElement
    ? document.activeElement.tagName.toLowerCase() === 'input' ||
      document.activeElement.tagName.toLowerCase() === 'textfield' ||
      document.activeElement.tagName.toLowerCase() === 'select'
    : false;

export const hasURLBar = () => {
  if (!isBrowser()) return false;

  const bodyHeight = Math.round(document.body.getBoundingClientRect().height);
  const htmlElement = document.querySelector('html');
  const htmlHeight = htmlElement
    ? Math.round(htmlElement.getBoundingClientRect().height)
    : 0;
  // Safari uses the device's width regardless of current orientation
  const screenHeight =
    isSafari() && isLandscape() ? window.screen.width : window.screen.height;

  return isSafari()
    ? bodyHeight !== screenHeight
    : window.innerHeight < htmlHeight;
};

export const documentZoom = () =>
  isBrowser() ? document.body.clientWidth / window.innerWidth : 1;

// low performance devices
export const isLowPerformanceIpad = () =>
  isAppleTablet() &&
  window.screen.width === 768 &&
  window.screen.height === 1024;

export const isLowPerformanceTablet = () =>
  isLowPerformanceIpad() ||
  (device.model
    ? LOW_PERFORMANCE_TABLETS.map(tablet => tablet.name).includes(device.model)
    : false);

export const isLowPerformanceIphone = () => {
  if (
    window.screen.height / window.screen.width === 667 / 375 &&
    window.devicePixelRatio === 2 &&
    isIOS()
  ) {
    return true; // "iPhone 6, 6s, 7 or 8";
  }
  // iPhone 5/5C/5s/SE or 6/6s/7 and 8 in zoom mode
  else if (
    window.screen.height / window.screen.width === 1.775 &&
    window.devicePixelRatio === 2 &&
    isIOS()
  ) {
    return true; // "iPhone 5, 5C, 5S, SE or 6, 6s, 7 and 8 (display zoom)";
  }
  // iPhone 4/4s
  else if (
    window.screen.height / window.screen.width === 1.5 &&
    window.devicePixelRatio === 2 &&
    isIOS()
  ) {
    return true; // "iPhone 4 or 4s";
  }
  // iPhone 1/3G/3GS
  else if (
    window.screen.height / window.screen.width === 1.5 &&
    window.devicePixelRatio === 1 &&
    isIOS()
  ) {
    return true; // "iPhone 1, 3G or 3GS";
  } else {
    return false;
  }
};
