import { debounce } from '@/utils/debounce';
import { getViewportInfo } from '@/utils/dom';
import passiveEvent from '@/utils/passiveEvent';
import {
  isAndroid,
  isBrowser,
  isDesktop,
  isInputFocused,
  isIOS,
  isLandscape,
  isMobile,
  isRecentIPadSafari,
  isTablet,
} from '@/utils/platform';

const MOBILE_DEBOUNCE_DELAY = 250;

export interface SizeInfo {
  width: number;
  height: number;
  devicePixelRatio: number;
  isLandscape: boolean;
}

class ResizeService {
  private all: (() => void)[];
  private checkInterval: number | null;
  private _size: SizeInfo | null = null;
  private _initialDevicePixelRatio: number | null = null;

  get initialDevicePixelRatio() {
    return this._initialDevicePixelRatio ?? 1;
  }

  private set initialDevicePixelRatio(value: number) {
    this._initialDevicePixelRatio = value;
  }

  get size() {
    return this._size;
  }

  private set size(value: ResizeService['_size']) {
    this._size = value;
  }

  constructor() {
    this.all = [];
    this.checkInterval = null;
    this.size = this.getSize();

    this.addListeners();
  }

  addListeners() {
    if (!isBrowser()) return;

    // Needed for Retina screens, etc.
    this.initialDevicePixelRatio = window.devicePixelRatio;

    window.addEventListener(
      isDesktop() ? 'resize' : 'orientationchange',
      this.onResize,
      passiveEvent
    );

    // Some devices don't trigger the resize event when the URL bar enters/exits the viewport
    if (!isDesktop() && !this.checkInterval) {
      this.checkInterval = window.setInterval(this.onResize, 1000);
    }

    this.iosFix();
    this.vhFix();
    this.setZoomLevel();
  }

  removeListeners() {
    if (!isBrowser()) return;
    window.removeEventListener(
      isDesktop() ? 'resize' : 'orientationchange',
      this.onResize
    );

    if (this.checkInterval) {
      window.clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  add(handler: () => void, run = false) {
    if (!this.all.includes(handler)) {
      this.all.push(handler);
    }
    if (run) handler();
  }

  remove(handler: () => void) {
    this.all = this.all.filter(h => h !== handler);
  }

  private getSize(): SizeInfo {
    return {
      width: isBrowser() ? window.innerWidth : 0,
      height: isBrowser() ? window.innerHeight : 0,
      devicePixelRatio: isBrowser() ? window.devicePixelRatio : 0,
      isLandscape: isLandscape(),
    };
  }

  private iosFix() {
    if ((isIOS() || isRecentIPadSafari()) && !isInputFocused()) {
      document.body.style.minHeight = `${window.innerHeight}px`;
    }
  }

  private vhFix() {
    if (!isBrowser()) return;

    // Base it on the size of the window when there's no software keyboard on screen
    if (!isInputFocused()) {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
  }

  private setZoomLevel() {
    // iOS doesn't scale non-px units automatically when zooming
    if (
      !process.env.ALLOW_USER_ZOOM ||
      !isBrowser() ||
      (!isDesktop() && !isIOS())
    )
      return;

    const zoomLevel = isIOS()
      ? window.outerWidth / window.innerWidth
      : this.size?.devicePixelRatio ?? 0;
    document.documentElement.style.setProperty(
      '--zoomLevel',
      `${zoomLevel / this.initialDevicePixelRatio}`
    );
  }

  private readonly onResize = debounce(
    () => {
      // Only update if values change
      const newSize = this.getSize();
      const needsViewportUpdate =
        isAndroid() &&
        (getViewportInfo().width !== newSize.width ||
          getViewportInfo().height !== newSize.height);

      if (
        newSize.width === this.size?.width &&
        newSize.height === this.size?.height &&
        newSize.devicePixelRatio === this.size?.devicePixelRatio &&
        newSize.isLandscape === this.size?.isLandscape &&
        !needsViewportUpdate
      )
        return;

      this.iosFix();
      this.vhFix();
      this.setZoomLevel();

      // If the keyboard is open on touch devices
      if (!isDesktop() && isInputFocused()) {
        if ((isMobile() && isLandscape()) || (isTablet() && !isLandscape())) {
          // In the wrong orientation, dismiss the keyboard, so we can show the rotate screen warning
          const activeElement = document.activeElement as HTMLElement;
          activeElement.blur();
        }
      }

      this.size = newSize;
      this.all.map(handler => handler());
    },
    // Some mobile browsers only update window.innerHeight when the rotate animation finishes
    !isDesktop() ? MOBILE_DEBOUNCE_DELAY : 0,
    true,
    true
  );
}

const resizeService = new ResizeService();
export default resizeService;
