//@flow

import type { AxisYGeneratorInterface, AxisYItemType } from './AxisYGeneratorInterface';
import type { NavigationScopeType } from '../../Navigation/NavigationInterface';
import type { ChartDataType } from '../../Chart';

export default class AxisYGenerator implements AxisYGeneratorInterface {

    _data: ChartDataType;
    _navigationScope: NavigationScopeType;
    _cacheAxisYItems: null | AxisYItemType[] = null;

    constructor(data: ChartDataType, navigationScope: NavigationScopeType) {
        this._data = data;
        this._navigationScope = navigationScope;
    }

    setNavigationScope(navigationScope: NavigationScopeType): void {
        this._navigationScope = navigationScope;
        this._cacheAxisYItems = null;
    }

    //getVisible

    getAxisYItems(): null | AxisYItemType[] {
        if (this._cacheAxisYItems) {
            return this._cacheAxisYItems;
        }

        const items: AxisYItemType[] = [];

        this._data.x.forEach((value, index) => {
            if (index % 10 !== 0) {
                return;
            }
            const date = new Date(value);
            items.push({
                title: `${date.getMonth() + 1}.${date.getDate()}`,
                index,
            });
        });

        this._cacheAxisYItems = items;
        return this._cacheAxisYItems;
    }

}
