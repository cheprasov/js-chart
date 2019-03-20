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
    _cacheMod: ?number = null;
    _cacheMods: ?number[] = null;

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
    }

    setNavigationScope(navigationScope: NavigationScopeType): void {
        this._navigationScope = navigationScope;
        this._cacheMod = null;
        this._cacheMods = null;
    }

    getMod(): number {
        if (this._cacheMod) {
            return this._cacheMod;
        }
        const beginI = Math.floor(this._data.maxIndex * this._navigationScope.minXRatio);
        const endI = Math.ceil(this._data.maxIndex * this._navigationScope.maxXRatio);

        const itemsCount = endI - beginI + 1;
        const count = this._width / this._textWidth;
        this._cacheMod = MathUtils.maxModBy2(itemsCount, count);
        return this._cacheMod;
    }

    getActiveMods(): number[] {
        if (this._cacheMods) {
            return this._cacheMods;
        }

        let currentMod = this.getMod();
        this._cacheMods = [currentMod];

        while (currentMod > 1) {
            currentMod /= 2;
            this._cacheMod.push(currentMod);
        }

        return this._cacheMod;
    }

    getAxisXItems(): AxisXItemType[] {

        return this._items;
    }

}
