//@flow

import type { AxisXGeneratorInterface, AxisXItemType } from './AxisXGeneratorInterface';
import type { NavigationScopeType } from '../../Navigation/NavigationInterface';
import type { ChartDataType } from '../../Chart';
import DateUtils from '../../../Utils/DateUtils';
import MathUtils from '../../../Utils/MathUtils';

export default class AxisXGenerator implements AxisXGeneratorInterface {

    _data: ChartDataType;
    _navigationScope: NavigationScopeType;
    _width: number;
    _textWidth: number;

    _items: AxisXItemType[] = [];

    constructor(data: ChartDataType, navigationScope: NavigationScopeType, width: number, textWidth: number) {
        this._data = data;
        this._navigationScope = navigationScope;
        this._width = width;
        this._textWidth = textWidth;

        this._generateItems();
    }

    _generateItems() {
        this._items = this._data.x.map((value: number, index: number) => {
            return { title: DateUtils.getMonDate(value), index };
        });

        // const step = Math.ceil(this._data.length / (count + 1));
        // const baseIndexes = [];
        // for (let i = 0; i < this._data.length; i += step) {
        //     const value = Math.round(i + step / 2);
        //     if (value <= this._data.length) {
        //         baseIndexes.push(value);
        //     }
        // }
        //
        // const stages = [baseIndexes];
        // const stage = [baseIndexes.];
        // for (let i = 1; i < baseIndexes.length; i += 1) {
        //     stage.push(
        //         MathUtils.average(baseIndexes[i], baseIndexes[i + 1]),
        //         baseIndexes[i + 1],
        //     );
        // }
    }

    setNavigationScope(navigationScope: NavigationScopeType): void {
        this._navigationScope = navigationScope;
        this._cacheAxisXItems = null;
    }

    //getVisible

    getAxisXItems(): AxisXItemType[] {
        return this._items;
        if (this._cacheAxisXItems) {
            return this._cacheAxisXItems;
        }

        this._cacheAxisXItems = [];
        return this._cacheAxisXItems;
    }

}
