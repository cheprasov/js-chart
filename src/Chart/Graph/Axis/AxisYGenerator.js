//@flow

import type { AxisYGeneratorInterface, AxisYItemsMapType } from './AxisYGeneratorInterface';
import type { NavigationScopeType } from '../../Navigation/NavigationInterface';
import MathUtils from '../../../Utils/MathUtils';

export default class AxisYGenerator implements AxisYGeneratorInterface {

    _count: number;
    _navigationScope: NavigationScopeType;
    _cacheAxisYItemsMap: null | AxisYItemsMapType = null;

    constructor(count: number, navigationScope: NavigationScopeType) {
        this._count = count;
        this._navigationScope = navigationScope;
    }

    setNavigationScope(navigationScope: NavigationScopeType): void {
        this._navigationScope = navigationScope;
        this._cacheAxisYItemsMap = null;
    }

    getAxisYItemsMap(): null | AxisYItemsMapType {
        if (!this._navigationScope || this._navigationScope.maxValueSlice === null
            || this._navigationScope.minValueSlice === null) {
            return null;
        }

        if (this._cacheAxisYItemsMap) {
            return this._cacheAxisYItemsMap;
        }

        const topValue = MathUtils.largeCeil(this._navigationScope.maxValueSlice);
        const lowValue = MathUtils.largeFloor(this._navigationScope.minValueSlice);
        const stepValue = Math.round((topValue - lowValue) / (this._count - 1));

        const itemsMap: AxisYItemsMapType = {};

        for (let i = 0; i < this._count; i += 1) {
            const value = MathUtils.largeFloor(lowValue + i * stepValue);
            itemsMap[value] = {
                value,
                title: MathUtils.formatLargeNumber(value),
            };
        }

        this._cacheAxisYItemsMap = Object.freeze(itemsMap);
        return this._cacheAxisYItemsMap;
    }

}
