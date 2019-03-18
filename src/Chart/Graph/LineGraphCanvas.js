// @flow

import WebAnimation from '@cheprasov/web-animation';
import type { ProgressType } from '@cheprasov/web-animation/src/WebAnimation';

import ScreenUtils from '../../Utils/ScreenUtils';
import { easingOutSine } from '../../Utils/Easing';

import type { GraphInterface } from './GraphInterface';
import type { ChartDataType, ChartLineType } from '../Chart';
import type { VisibilityMapType } from '../Legend/LegendInterface';
import type { NavigationScopeType } from '../Navigation/NavigationInterface';
import type { AxisXGeneratorInterface, AxisXItemType } from './Axis/AxisXGeneratorInterface';
import type { AxisYGeneratorInterface, AxisYItemType } from './Axis/AxisYGeneratorInterface';

export type GraphScopeType = {
    maxValue: ?number,
    minValue: ?number,
    scaleX: ?number,
    scaleY: ?number,
}

type LineDataType = {
    scope: GraphScopeType,
    opacity: number,
};

export type LineDataMapType = {
    [string]: LineDataType
};

type AxisXDataType = {
    hash: string,
    items: AxisXItemType[],
    scope: GraphScopeType,
    opacity: number,
}

type AxisXDataMapType = {
    [string]: AxisXDataType
};

export type OptionsType = {
    data: ChartDataType,
    visibilityMap: VisibilityMapType,
    navigationScope: NavigationScopeType,
    width: number,
    height: number,
    devicePixelRatio?: number,
    verticalPaddingRatio?: number,
    animationDuration?: number,
    lineWidth?: number,
    axisXGenerator?: AxisXGeneratorInterface,
    axisYGenerator?: AxisYGeneratorInterface,
    renderQualityRatio?: number,
}

const DEFAULT_CONSTRUCTOR_PARAMS = {
    data: null,
    visibilityMap: null,
    navigationScope: null,
    width: 100,
    height: 50,
    devicePixelRatio: ScreenUtils.getDevicePixelRatio(),
    verticalPaddingRatio: 0.2, // 20%
    animationDuration: 200,
    lineWidth: 1.5,
    axisXGenerator: null,
    axisYGenerator: null,
    renderQualityRatio: 1,
};

export default class LineGraphCanvas implements GraphInterface {

    _data: ChartDataType;
    _visibilityMap: VisibilityMapType;
    _navigationScope: NavigationScopeType;

    _width: number;
    _height: number;
    _devicePixelRatio: number;
    _verticalPaddingRatio: number;
    _lineWidth: number;
    _verticalPadding: number;
    _renderQualityRatio: number;

    _axisXGenerator: AxisXGeneratorInterface | null = null;
    _axisYGenerator: AxisYGeneratorInterface | null = null;

    _canvas: HTMLCanvasElement;
    _context: CanvasRenderingContext2D;
    _canvasWidth: number;
    _canvasHeight: number;

    // separate scope for each line is because different animation on task mock
    _lineDataMap: LineDataMapType;
    _axisXDataMap: AxisXDataMapType;
    _axisXHash: string;

    _animation: ?WebAnimation;

    constructor(options: OptionsType = {}) {
        const params = { ...DEFAULT_CONSTRUCTOR_PARAMS, ...options };

        this._data = params.data;
        this._visibilityMap = params.visibilityMap;
        this._navigationScope = params.navigationScope;

        this._width = params.width;
        this._height = params.height;
        this._devicePixelRatio = params.devicePixelRatio;
        this._renderQualityRatio = Math.min(1, Math.max(0.1, params.renderQualityRatio));
        this._verticalPaddingRatio = params.verticalPaddingRatio;
        this._lineWidth = params.lineWidth;
        this._axisXGenerator = params.axisXGenerator;
        this._axisYGenerator = params.axisYGenerator;

        this._canvasWidth = Math.round(this._getCanvasValue(this._width));
        this._canvasHeight = Math.round(this._getCanvasValue(this._height));
        this._verticalPadding = this._canvasHeight * this._verticalPaddingRatio / 2;

        this._onAnimationEnd = this._onAnimationEnd.bind(this);

        this._animation = new WebAnimation({
            duration: params.animationDuration,
            easing: easingOutSine,
            onStop: this._onAnimationEnd,
            onFinish: this._onAnimationEnd,
        });

        this._initCanvas();
        this._initLineDataMap();
        this._initAxisXDataMap();
        this._draw();
    }

    _initCanvas() {
        this._canvas = document.createElement('canvas');
        this._canvas.width = this._canvasWidth;
        this._canvas.height = this._canvasHeight;

        this._context = this._canvas.getContext('2d');
        this._context.lineJoin = 'bevel';
        this._context.lineCap = 'butt';
        this._context.fillStyle = '#96a2aa';
        this._context.font = `${this._getCanvasValue(16)}px Arial`;
    }

    _getCanvasValue(value: number) {
        return this._devicePixelRatio * this._renderQualityRatio * value;
    }

    _initLineDataMap() {
        const scope = this._getGraphScope();
        this._lineDataMap = {};
        this._data.lines.forEach((chartLine: ChartLineType) => {
            this._lineDataMap[chartLine.key] = {
                scope: { ...scope },
                opacity: 1,
            };
        });
    }

    _initAxisXDataMap() {
        if (!this._axisXGenerator) {
            return;
        }

        this._axisXHash = this._axisXGenerator.getHash();
        this._axisXDataMap = {
            [this._axisXHash]: {
                hash: this._axisXHash,
                items: this._axisXGenerator.getAxisXItems(),
                scope: this._getGraphScope(),
                opacity: 1,
            },
        };
    }

    setNavigationScope(navigationScope: NavigationScopeType): void {
        this._navigationScope = navigationScope;
        if (this._axisXGenerator) {
            const prevAxisXHash = this._axisXHash;
            this._axisXGenerator.setNavigationScope(navigationScope);
            this._updateAxisXData(prevAxisXHash);
        }
        this._drawAnimation(this._getGraphScope());
    }

    _updateAxisXData(prevAxisXHash: string) {
        const currentAxisXHash = this._axisXGenerator.getHash();
        if (!currentAxisXHash || this._axisXDataMap[currentAxisXHash]) {
            return;
        }

        Object.keys(this._axisXDataMap).forEach((hash) => {
            if (hash !== prevAxisXHash && hash !== currentAxisXHash) {
                delete this._axisXDataMap[hash];
            }
        });

        this._axisXHash = currentAxisXHash;
        this._axisXDataMap[currentAxisXHash] = {
            hash: currentAxisXHash,
            items: this._axisXGenerator.getAxisXItems(),
            scope: { ...this._axisXDataMap[prevAxisXHash].scope },
            opacity: 0,
        };
        this._axisXDataMap[prevAxisXHash].opacity = 1;
    }

    setVisibilityMap(visibilityMap: VisibilityMapType): void {
        this._visibilityMap = visibilityMap;
        this._drawAnimation(this._getGraphScope());
    }

    _getPrevLineDataMap(): LineDataMapType {
        const prevLineDataMap: LineDataMapType = {};
        Object.entries(this._lineDataMap).forEach(([key, lineData]) => {
            prevLineDataMap[key] = {
                opacity: lineData.opacity,
                scope: { ...lineData.scope },
            };
        });
        return prevLineDataMap;
    }

    _getPrevAxisXDataMap(): AxisXDataMapType {
        const prevAxisXDataMap: AxisXDataMapType = {};
        Object.entries(this._axisXDataMap).forEach(([hash, axisXData]) => {
            prevAxisXDataMap[hash] = {
                ...axisXData,
                scope: { ...axisXData.scope },
            };
        });

        return prevAxisXDataMap;
    }

    _drawAnimation(newScope: GraphScopeType) {
        this._animation.stop();

        const prevLineDataMap: LineDataMapType = this._getPrevLineDataMap();
        const prevAxisXDataMap: AxisXDataMapType = this._getPrevAxisXDataMap();
        const isNotEmptyGraph = Object.values(this._visibilityMap).some((isVisible: boolean) => isVisible);

        this._animation.setOnStep((progress: ProgressType) => {
            this._drawLinesAnimation(progress, newScope, prevLineDataMap, isNotEmptyGraph);
            this._drawXAxisAnimation(progress, newScope, prevAxisXDataMap, isNotEmptyGraph);
            this._clear();
            this._draw();
        });

        this._animation.run();
    }

    _drawLinesAnimation(
        progress: ProgressType, newScope: GraphScopeType, prevLineDataMap: LineDataMapType, isNotEmptyGraph: boolean,
    ) {
        Object.entries(this._lineDataMap).forEach(([key, lineData]) => {
            const isVisible = this._visibilityMap[key];
            const prevOpacity: number = prevLineDataMap[key].opacity;
            const prevScope = prevLineDataMap[key].scope;

            if (isNotEmptyGraph) {
                lineData.scope = {
                    maxValue: (newScope.maxValue - prevScope.maxValue) * progress.tween + prevScope.maxValue,
                    minValue: (newScope.minValue - prevScope.minValue) * progress.tween + prevScope.minValue,
                    scaleY: (newScope.scaleY - prevScope.scaleY) * progress.tween + prevScope.scaleY,
                };
            } else {
                lineData.scope = { ...prevScope };
            }

            const opacity = isVisible ? 1 : 0;
            lineData.opacity = (opacity - prevOpacity) * progress.tween + prevOpacity;
        });
    }

    _drawXAxisAnimation(
        progress: ProgressType, newScope: GraphScopeType, prevAxisXDataMap: AxisXDataMapType, isNotEmptyGraph: boolean,
    ): void {
        if (!this._axisXGenerator || !isNotEmptyGraph) {
            return;
        }

        Object.entries(this._axisXDataMap).forEach(([hash, axisXData]) => {
            if (!prevAxisXDataMap[hash]) {
                delete this._axisXDataMap[hash];
                return;
            }
            const prevScope = prevAxisXDataMap[hash].scope;
            axisXData.scope = {
                maxValue: (newScope.maxValue - prevScope.maxValue) * progress.tween + prevScope.maxValue,
                minValue: (newScope.minValue - prevScope.minValue) * progress.tween + prevScope.minValue,
                scaleY: (newScope.scaleY - prevScope.scaleY) * progress.tween + prevScope.scaleY,
            };
            const prevOpacity: number = prevAxisXDataMap[hash].opacity;
            const opacity = this._axisXHash === hash ? 1 : 0;
            axisXData.opacity = (opacity - prevOpacity) * progress.tween + prevOpacity;
        });
    }

    _onAnimationEnd() {
        if (!this._axisXDataMap) {
            return;
        }

        Object.keys(this._axisXDataMap).forEach((hash: string) => {
            if (this._axisXHash !== hash && !this._axisXDataMap[hash].opacity) {
                delete this._axisXDataMap[hash];
            }
        });
    }

    _getGraphScope(): GraphScopeType {
        return {
            minValue: this._navigationScope.minValueSlice,
            maxValue: this._navigationScope.maxValueSlice,
            scaleY: this._canvasHeight * (1 - this._verticalPaddingRatio)
                / ((this._navigationScope.maxValueSlice - this._navigationScope.minValueSlice) || 1),
        };
    }

    getGraphElement(): HTMLCanvasElement {
        return this._canvas;
    }

    _draw(): void {
        const minXRatio = this._navigationScope.minXRatio;
        const maxXRatio = this._navigationScope.maxXRatio;

        const scaleX = this._canvasWidth / ((this._data.length - 1) * (maxXRatio - minXRatio));
        const shiftX = scaleX * (this._data.length - 1) * minXRatio;

        const beginI = Math.floor((this._data.length - 1) * minXRatio);
        const endI = Math.ceil((this._data.length - 1) * maxXRatio);

        this._drawAxisXLines();
        this._data.lines.forEach((chartLine: ChartLineType) => {
            this._drawLine(chartLine, scaleX, shiftX, beginI, endI);
        });
        this._drawAxisXText();
        this._drawAxisYTitles(scaleX, shiftX);
    }

    _clear(): void {
        this._context.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
    }

    _drawAxisYTitles(scaleX: number, shiftX: number) {
        const items: AxisYItemType[] = this._axisYGenerator.getAxisYItems();

        const context = this._context;
        context.save();
        context.translate(0, this._canvasHeight - this._verticalPadding);

        items.forEach((item: AxisYItemType) => {
            context.globalAlpha = 1;
            const x = item.index * scaleX - shiftX;
            context.fillText(item.title, x, this._getCanvasValue(18));
        });
        context.restore();
    }

    _drawAxisXLines() {
        if (!this._axisXDataMap) {
            return;
        }
        const context = this._context;
        context.save();
        context.translate(0, this._canvasHeight - this._verticalPadding);
        context.strokeStyle = '#dfe6eb';
        context.lineWidth = this._getCanvasValue(1);

        Object.values(this._axisXDataMap).forEach((axisXData: AxisXDataType) => {
            context.globalAlpha = axisXData.opacity;
            context.beginPath();

            axisXData.items.forEach((item: AxisXItemType) => {
                const y = -(item.value - axisXData.scope.minValue) * axisXData.scope.scaleY;
                context.moveTo(0, y);
                context.lineTo(this._canvasWidth, y);
            });

            context.stroke();
        });
        context.restore();
    }

    _drawAxisXText() {
        if (!this._axisXDataMap) {
            return;
        }
        const context = this._context;
        context.save();
        context.translate(0, this._canvasHeight - this._verticalPadding);

        Object.values(this._axisXDataMap).forEach((axisXData: AxisXDataType) => {
            context.globalAlpha = axisXData.opacity;
            axisXData.items.forEach((item: AxisXItemType) => {
                const y = -(item.value - axisXData.scope.minValue) * axisXData.scope.scaleY;

                context.fillText(item.title, 0, y - this._getCanvasValue(8));
            });
        });
        context.restore();
    }

    _drawLine(chartLine: ChartLineType, scaleX: number, shiftX: number, beginI: number, endI: number) {
        const lineData = this._lineDataMap[chartLine.key];

        const context = this._context;
        context.save();
        context.translate(0, this._canvasHeight - this._verticalPadding);
        context.lineWidth = this._getCanvasValue(this._lineWidth);
        context.strokeStyle = chartLine.color;
        context.globalAlpha = lineData.opacity;
        context.beginPath();

        let isMoveTo = true;
        for (let index = beginI; index <= endI; index += 1) {
            const value = chartLine.values[index];
            if (value === null) {
                isMoveTo = true;
                continue;
            }

            const x = index * scaleX - shiftX;
            const y = -(value - lineData.scope.minValue) * lineData.scope.scaleY;

            if (isMoveTo) {
                context.moveTo(x, y);
                isMoveTo = false;
            } else {
                context.lineTo(x, y);
            }
        }

        context.stroke();
        context.restore();
    }

}