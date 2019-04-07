// @flow

import type { ProgressType } from '@cheprasov/web-animation/src/WebAnimation';

import LineGraphCanvas from './LineGraphCanvas';

import type { GraphScopeType, LineDataMapType, OptionsType } from './LineGraphCanvas';
import type { ChartLineType } from '../Chart';

export default class NavigationLineGraphCanvas extends LineGraphCanvas {

    constructor(options: OptionsType = {}) {
        super(options);
    }

    _drawLinesAnimation(progress: ProgressType, newScope: GraphScopeType, prevLineDataMap: LineDataMapType) {
        Object.entries(this._lineDataMap).forEach(([key, lineData]) => {
            const isVisible = this._visibilityMap.isVisible(key);
            const prevOpacity: number = prevLineDataMap[key].opacity;
            const prevScope = prevLineDataMap[key].scope;
            if (isVisible) {
                if (prevOpacity) {
                    lineData.scope = {
                        maxValue: (newScope.maxValue - prevScope.maxValue) * progress.tween + prevScope.maxValue,
                        minValue: (newScope.minValue - prevScope.minValue) * progress.tween + prevScope.minValue,
                        scaleY: (newScope.scaleY - prevScope.scaleY) * progress.tween + prevScope.scaleY,
                    };
                } else {
                    lineData.scope = { ...newScope };
                }
            }
            const opacity = isVisible ? 1 : 0;
            lineData.opacity = (opacity - prevOpacity) * progress.tween + prevOpacity;
        });
    }

    _getGraphScope(): GraphScopeType {
        return {
            minValue: this._navigationScope.minValue,
            maxValue: this._navigationScope.maxValue,
            scaleY: this._canvasHeight * (1 - this._verticalPaddingRatio)
                / ((this._navigationScope.maxValue - this._navigationScope.minValue) || 1),
        };
    }

    _draw(): void {
        this._clear();
        const scaleX = this._canvasWidth / this._data.maxIndex;

        this._data.lines.forEach((chartLine: ChartLineType) => {
            this._drawLine(chartLine, scaleX, 0, 0, this._data.maxIndex);
        });
    }

}
