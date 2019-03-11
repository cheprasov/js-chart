// @flow

export default class DisplayUtils {

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
