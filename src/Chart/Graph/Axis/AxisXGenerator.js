//@flow

import type { AxisXGeneratorInterface, AxisXLineType } from './AxisXGeneratorInterface';
import type { NavigationScopeType } from '../../Navigation/NavigationInterface';
import MathUtils from '../../../Utils/MathUtils';

export default class AxisXGenerator implements AxisXGeneratorInterface {

    _lineCount: number;
    _navigationScope: NavigationScopeType;
    _cacheAxisXLines: null | AxisXLineType[] = null;
    _cacheHash: null | string = null;

    constructor(lineCount: number, navigationScope: NavigationScopeType) {
        this._lineCount = lineCount;
        this._navigationScope = navigationScope;
    }

    setNavigationScope(navigationScope: NavigationScopeType): void {
        this._navigationScope = navigationScope;
        this._cacheAxisXLines = null;
        this._cacheHash = null;
    }

    getHash(): null | string {
        if (!this.getAxisXLines() || !this._cacheAxisXLines) {
            return null;
        }
        if (this._cacheHash) {
            return this._cacheHash;
        }
        this._cacheHash = this._cacheAxisXLines.reduce((result: number[], line: AxisXLineType) => {
            result.push(line.value);
            return result;
        }, []).join('/');

        return this._cacheHash;
    }

    getAxisXLines(): null | AxisXLineType[] {
        if (!this._navigationScope || this._navigationScope.maxValueSlice === null
            || this._navigationScope.minValueSlice === null) {
            return null;
        }

        if (this._cacheAxisXLines) {
            return this._cacheAxisXLines;
        }

        const topValue = MathUtils.largeRound(this._navigationScope.maxValueSlice);
        const lowValue = MathUtils.largeFloor(this._navigationScope.minValueSlice);
        const stepValue = Math.round((topValue - lowValue) / (this._lineCount - 1));

        const lines: AxisXLineType[] = [];

        for (let i = 0; i < this._lineCount; i += 1) {
            const value = MathUtils.largeFloor(lowValue + i * stepValue);
            const title = MathUtils.formatLargeNumber(value);
            lines.push({ value, title });
        }

        this._cacheAxisXLines = Object.freeze(lines);
        return this._cacheAxisXLines;
    }

}
