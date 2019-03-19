//@flow

import type { AxisYGeneratorInterface, AxisYItemType } from './AxisYGeneratorInterface';
import type { NavigationScopeType } from '../../Navigation/NavigationInterface';
import MathUtils from '../../../Utils/MathUtils';

export default class AxisYGenerator implements AxisYGeneratorInterface {

    _count: number;
    _navigationScope: NavigationScopeType;
    _cacheAxisYItems: null | AxisYItemType[] = null;
    _cacheHash: null | string = null;

    constructor(count: number, navigationScope: NavigationScopeType) {
        this._count = count;
        this._navigationScope = navigationScope;
    }

    setNavigationScope(navigationScope: NavigationScopeType): void {
        this._navigationScope = navigationScope;
        this._cacheAxisYItems = null;
        this._cacheHash = null;
    }

    getHash(): null | string {
        if (!this.getAxisYItems() || !this._cacheAxisYItems) {
            return null;
        }
        if (this._cacheHash) {
            return this._cacheHash;
        }
        this._cacheHash = this._cacheAxisYItems.reduce((result: number[], item: AxisYItemType) => {
            result.push(item.value);
            return result;
        }, []).join('/');

        return this._cacheHash;
    }

    getAxisYItems(): null | AxisYItemType[] {
        if (!this._navigationScope || this._navigationScope.maxValueSlice === null
            || this._navigationScope.minValueSlice === null) {
            return null;
        }

        if (this._cacheAxisYItems) {
            return this._cacheAxisYItems;
        }

        const topValue = MathUtils.largeRound(this._navigationScope.maxValueSlice);
        const lowValue = MathUtils.largeFloor(this._navigationScope.minValueSlice);
        const stepValue = Math.round((topValue - lowValue) / (this._count - 1));

        const items: AxisYItemType[] = [];

        for (let i = 0; i < this._count; i += 1) {
            const value = MathUtils.largeFloor(lowValue + i * stepValue);
            const title = MathUtils.formatLargeNumber(value);
            items.push({ value, title });
        }

        this._cacheAxisYItems = Object.freeze(items);
        return this._cacheAxisYItems;
    }

}
