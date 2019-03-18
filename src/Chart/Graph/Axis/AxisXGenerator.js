//@flow

import type { AxisXGeneratorInterface, AxisXItemType } from './AxisXGeneratorInterface';
import type { NavigationScopeType } from '../../Navigation/NavigationInterface';
import MathUtils from '../../../Utils/MathUtils';

export default class AxisXGenerator implements AxisXGeneratorInterface {

    _count: number;
    _navigationScope: NavigationScopeType;
    _cacheAxisXItems: null | AxisXItemType[] = null;
    _cacheHash: null | string = null;

    constructor(count: number, navigationScope: NavigationScopeType) {
        this._count = count;
        this._navigationScope = navigationScope;
    }

    setNavigationScope(navigationScope: NavigationScopeType): void {
        this._navigationScope = navigationScope;
        this._cacheAxisXItems = null;
        this._cacheHash = null;
    }

    getHash(): null | string {
        if (!this.getAxisXItems() || !this._cacheAxisXItems) {
            return null;
        }
        if (this._cacheHash) {
            return this._cacheHash;
        }
        this._cacheHash = this._cacheAxisXItems.reduce((result: number[], item: AxisXItemType) => {
            result.push(item.value);
            return result;
        }, []).join('/');

        return this._cacheHash;
    }

    getAxisXItems(): null | AxisXItemType[] {
        if (!this._navigationScope || this._navigationScope.maxValueSlice === null
            || this._navigationScope.minValueSlice === null) {
            return null;
        }

        if (this._cacheAxisXItems) {
            return this._cacheAxisXItems;
        }

        const topValue = MathUtils.largeRound(this._navigationScope.maxValueSlice);
        const lowValue = MathUtils.largeFloor(this._navigationScope.minValueSlice);
        const stepValue = Math.round((topValue - lowValue) / (this._count - 1));

        const items: AxisXItemType[] = [];

        for (let i = 0; i < this._count; i += 1) {
            const value = MathUtils.largeFloor(lowValue + i * stepValue);
            const title = MathUtils.formatLargeNumber(value);
            items.push({ value, title });
        }

        this._cacheAxisXItems = Object.freeze(items);
        return this._cacheAxisXItems;
    }

}
