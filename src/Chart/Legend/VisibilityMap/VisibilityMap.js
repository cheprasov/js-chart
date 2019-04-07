import type { VisibilityType } from '../LegendInterface';

export default class VisibilityMap {

    _visibility: VisibilityType;
    _isEmpty: boolean;

    constructor(visibility: VisibilityType) {
        this._visibility = { ...visibility };
        this._isEmpty = !Object.values(visibility).some((isVisible: boolean) => isVisible);
    }

    isVisible(key: string): boolean {
        return this._visibility[key] || false;
    }

    isEmpty(): boolean {
        return this._isEmpty;
    }

}
