// @flow

const IS_TOUCH_SCREEN = ('ontouchstart' in document.documentElement);

export default class ScreenUtils {

    static isTouchScreen(): boolean {
        return IS_TOUCH_SCREEN;
    }

    static getDevicePixelRatio(): number {
        if (window.devicePixelRatio) {
            return window.devicePixelRatio;
        }
        if (window.screen && window.screen.deviceXDPI && window.screen.logicalXDPI) {
            return window.screen.deviceXDPI / window.screen.logicalXDPI;
        }
        return 1;
    }

}
