// @flow

import WebAnimation from '@cheprasov/web-animation';
import type { ProgressType } from '@cheprasov/web-animation/src/WebAnimation';

import ScreenUtils from '../../Utils/ScreenUtils';
import { easingOutSine } from '../../Utils/Easing';

import type { GraphInterface } from './GraphInterface';
import type { ChartDataType, ChartLineType } from '../Chart';
import type { VisibilityMapType } from '../Legend/LegendInterface';
import type { NavigationScopeType } from '../Navigation/NavigationInterface';
import type { AxisYGeneratorInterface, AxisYItemType } from './Axis/AxisYGeneratorInterface';
import type { AxisXGeneratorInterface, AxisXItemType } from './Axis/AxisXGeneratorInterface';
import MathUtils from '../../Utils/MathUtils';

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

type AxisYDataType = {
    hash: string,
    items: AxisYItemType[],
    scope: GraphScopeType,
    opacity: number,
}

type AxisYDataMapType = {
    [string]: AxisYDataType
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
    axisYGenerator?: AxisYGeneratorInterface,
    axisXGenerator?: AxisXGeneratorInterface,
    renderQualityRatio?: number,
}

const DEFAULT_CONSTRUCTOR_PARAMS = {
    data: null,
    visibilityMap: null,
    navigationScope: null,
    width: 100,
    height: 50,
    devicePixelRatio: Math.min(2, ScreenUtils.getDevicePixelRatio()),
    verticalPaddingRatio: 0.2, // 20%
    animationDuration: 200,
    lineWidth: 1.5,
    axisYGenerator: null,
    axisXGenerator: null,
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

    _axisYGenerator: AxisYGeneratorInterface | null = null;
    _axisXGenerator: AxisXGeneratorInterface | null = null;

    _canvas: HTMLCanvasElement;
    _context: CanvasRenderingContext2D;
    _canvasWidth: number;
    _canvasHeight: number;

    // separate scope for each line is because different animation on task mock
    _lineDataMap: LineDataMapType;
    _axisYDataMap: AxisYDataMapType;
    _axisYHash: string;

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
        this._axisYGenerator = params.axisYGenerator;
        this._axisXGenerator = params.axisXGenerator;

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
        this._initAxisYDataMap();
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

    _initAxisYDataMap() {
        if (!this._axisYGenerator) {
            return;
        }

        this._axisYHash = this._axisYGenerator.getHash();
        this._axisYDataMap = {
            [this._axisYHash]: {
                hash: this._axisYHash,
                items: this._axisYGenerator.getAxisYItems(),
                scope: this._getGraphScope(),
                opacity: 1,
            },
        };
    }

    setNavigationScope(navigationScope: NavigationScopeType): void {
        this._navigationScope = navigationScope;
        if (this._axisYGenerator) {
            const prevAxisYHash = this._axisYHash;
            this._axisYGenerator.setNavigationScope(navigationScope);
            this._updateAxisYData(prevAxisYHash);
        }
        this._drawAnimation(this._getGraphScope());
    }

    _updateAxisYData(prevAxisYHash: string) {
        const currentAxisYHash = this._axisYGenerator.getHash();
        if (!currentAxisYHash || this._axisYDataMap[currentAxisYHash]) {
            return;
        }

        Object.keys(this._axisYDataMap).forEach((hash) => {
            if (hash !== prevAxisYHash && hash !== currentAxisYHash) {
                delete this._axisYDataMap[hash];
            }
        });

        this._axisYHash = currentAxisYHash;
        this._axisYDataMap[currentAxisYHash] = {
            hash: currentAxisYHash,
            items: this._axisYGenerator.getAxisYItems(),
            scope: { ...this._axisYDataMap[prevAxisYHash].scope },
            opacity: 0,
        };
        this._axisYDataMap[prevAxisYHash].opacity = 1;
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

    _getPrevAxisYDataMap(): AxisYDataMapType {
        const prevAxisYDataMap: AxisYDataMapType = {};
        Object.entries(this._axisYDataMap).forEach(([hash, axisYData]) => {
            prevAxisYDataMap[hash] = {
                ...axisYData,
                scope: { ...axisYData.scope },
            };
        });

        return prevAxisYDataMap;
    }

    _drawAnimation(newScope: GraphScopeType) {
        this._animation.stop();

        const prevLineDataMap: LineDataMapType = this._getPrevLineDataMap();
        const prevAxisYDataMap: AxisYDataMapType = this._getPrevAxisYDataMap();
        const isNotEmptyGraph = Object.values(this._visibilityMap).some((isVisible: boolean) => isVisible);

        this._animation.setOnStep((progress: ProgressType) => {
            this._drawLinesAnimation(progress, newScope, prevLineDataMap, isNotEmptyGraph);
            this._drawAxisYAnimation(progress, newScope, prevAxisYDataMap, isNotEmptyGraph);
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

    _drawAxisYAnimation(
        progress: ProgressType, newScope: GraphScopeType, prevAxisYDataMap: AxisYDataMapType, isNotEmptyGraph: boolean,
    ): void {
        if (!this._axisYGenerator || !isNotEmptyGraph) {
            return;
        }

        Object.entries(this._axisYDataMap).forEach(([hash, axisYData]) => {
            if (!prevAxisYDataMap[hash]) {
                delete this._axisYDataMap[hash];
                return;
            }
            const prevScope = prevAxisYDataMap[hash].scope;
            axisYData.scope = {
                maxValue: (newScope.maxValue - prevScope.maxValue) * progress.tween + prevScope.maxValue,
                minValue: (newScope.minValue - prevScope.minValue) * progress.tween + prevScope.minValue,
                scaleY: (newScope.scaleY - prevScope.scaleY) * progress.tween + prevScope.scaleY,
            };
            const prevOpacity: number = prevAxisYDataMap[hash].opacity;
            const opacity = this._axisYHash === hash ? 1 : 0;
            axisYData.opacity = (opacity - prevOpacity) * progress.tween + prevOpacity;
        });
    }

    _onAnimationEnd() {
        if (!this._axisYDataMap) {
            return;
        }

        Object.keys(this._axisYDataMap).forEach((hash: string) => {
            if (this._axisYHash !== hash && !this._axisYDataMap[hash].opacity) {
                delete this._axisYDataMap[hash];
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

        this._drawAxisYLines();
        this._data.lines.forEach((chartLine: ChartLineType) => {
            this._drawLine(chartLine, scaleX, shiftX, beginI, endI);
        });
        this._drawAxisYText();
        this._drawAxisXTitles(scaleX, shiftX, beginI, endI);
    }

    _clear(): void {
        this._context.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
    }

    _drawAxisXTitles(scaleX: number, shiftX: number, beginI: number, endI: number) {
        const items: AxisXItemType[] = this._axisXGenerator.getAxisXItems();

        const context = this._context;
        context.save();
        //context.textAlign = 'center';
        context.translate(0, this._canvasHeight - this._verticalPadding);

        // 1, 2, 4, 8, 16, 32, 64, 128,
        const itemsCount = endI - beginI + 1;

        const textWidth = 60;

        const count = this._width / textWidth;
        const mod = MathUtils.minModBy2(itemsCount, count);
        //console.log(itemsCount / 6);

        const y = this._getCanvasValue(18);
        items.forEach((item: AxisXItemType, index: number) => {
            if (index % mod !== 0) {
                return;
            }
            //context.globalAlpha = 1;
            const x = item.index * scaleX - shiftX;
            context.fillText(item.title, x, y);
            //context.fillRect(x - this._getCanvasValue(textWidth / 2), 40, this._getCanvasValue(textWidth), 10);
        });
        context.restore();
    }

    _drawAxisYLines() {
        if (!this._axisYDataMap) {
            return;
        }
        const context = this._context;
        context.save();
        context.translate(0, this._canvasHeight - this._verticalPadding);
        context.strokeStyle = '#dfe6eb';
        context.lineWidth = this._getCanvasValue(1);

        Object.values(this._axisYDataMap).forEach((axisYData: AxisYDataType) => {
            context.globalAlpha = axisYData.opacity;
            context.beginPath();

            axisYData.items.forEach((item: AxisYItemType) => {
                const y = -(item.value - axisYData.scope.minValue) * axisYData.scope.scaleY;
                context.moveTo(0, y);
                context.lineTo(this._canvasWidth, y);
            });

            context.stroke();
        });
        context.restore();
    }

    _drawAxisYText() {
        if (!this._axisYDataMap) {
            return;
        }
        const context = this._context;
        context.save();
        context.translate(0, this._canvasHeight - this._verticalPadding);

        Object.values(this._axisYDataMap).forEach((axisYData: AxisYDataType) => {
            context.globalAlpha = axisYData.opacity;
            axisYData.items.forEach((item: AxisYItemType) => {
                const y = -(item.value - axisYData.scope.minValue) * axisYData.scope.scaleY;

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

        const minValue = lineData.scope.minValue;
        const scaleY = lineData.scope.scaleY;
        let isMoveTo = true;
        for (let index = beginI; index <= endI; index += 1) {
            const value = chartLine.values[index];

            const x = index * scaleX - shiftX;
            const y = -(value - minValue) * scaleY;

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
