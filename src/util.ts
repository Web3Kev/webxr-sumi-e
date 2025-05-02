
const USER_AGENT: string = navigator.userAgent.toLowerCase();

const DEVICE = {
  isTouchDevice: (): boolean =>
    'ontouchstart' in window || navigator.maxTouchPoints > 0 || (navigator as any).msMaxTouchPoints > 0,

  isOculus: (): boolean => /oculusbrowser/.test(USER_AGENT),

  isAppleVisionPro: (): boolean =>
    /ipad/.test(USER_AGENT) && navigator.maxTouchPoints === 0 && "xr" in navigator,

  isMobile: (): boolean =>
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(USER_AGENT) &&
    DEVICE.isTouchDevice(),

  isAppleMobile: (): boolean => /iphone|ipad/.test(USER_AGENT) && DEVICE.isTouchDevice(),

  isHeadset: (): boolean => DEVICE.isOculus() || DEVICE.isAppleVisionPro(),

  isDesktop: (): boolean => !DEVICE.isMobile() && !DEVICE.isHeadset(),

  // isXR: (): boolean => "xr" in navigator,
  isXR: async (): Promise<boolean> => {
    try {
      return !!navigator.xr && await navigator.xr.isSessionSupported("immersive-ar");
    } catch {
      return false;
    }
  },
};


// DETECT FULLSCREEN TAKING INTO ACCOUNT CHROME DESKTOP (F11 KEY / "FULL SCREEN" MENU)
enum WINDOW_MODE {
  NORMAL = 1,
  FULLSCREEN_API = 2,
  FULLSCREEN_BROWSER = 3,
}

const getWindowMode = (): WINDOW_MODE => {
  if (document.fullscreenElement !== null) return WINDOW_MODE.FULLSCREEN_API;
  else if (window.innerHeight === screen.height && window.innerWidth === screen.width)
    return WINDOW_MODE.FULLSCREEN_BROWSER;
  else return WINDOW_MODE.NORMAL;
};

const toggleFullscreen = (): void => {
  getWindowMode() === WINDOW_MODE.FULLSCREEN_API
    ? document.exitFullscreen()
    : document.documentElement.requestFullscreen();
};

export {
  DEVICE,
  WINDOW_MODE,
  getWindowMode,
  toggleFullscreen,
};