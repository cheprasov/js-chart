// @flow

import WebAnimation from '@cheprasov/web-animation';
import DisplayUtils from '../../Utils/DisplayUtils';
import { easingOutSine } from '../../Utils/Easing';

import type { GraphInterface } from './GraphInterface';
import type { ChartDataType, ChartLineType } from '../Chart';
import type { VisibilityMapType } from '../Legend/LegendInterface';
import type { NavigationScopeType } from '../Navigation/NavigationInterface';

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
    [string]: LineDataType,
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
}

const DEFAULT_CONSTRUCTOR_PARAMS = {
    data: null,
    visibilityMap: null,
    navigationScope: null,
    width: 100,
    height: 50,
    devicePixelRatio: DisplayUtils.getDevicePixelRatio(),
    verticalPaddingRatio: 0.20, // 20%
    animationDuration: 200,
    lineWidth: 1.5,
};

export default class GraphCanvas implements GraphInterface {

    _data: ChartDataType;
    _visibilityMap: VisibilityMapType;
    _navigationScope: NavigationScopeType;

    _width: number;
    _height: number;
    _devicePixelRatio: number;
    _verticalPaddingRatio: number;
    _lineWidth: number;
    _verticalPadding: number;

    _canvas: HTMLCanvasElement;
    _context: CanvasRenderingContext2D;
    _canvasWidth: number;
    _canvasHeight: number;

    // separate scope for each line is because different animation on task mock
    _lineDataMap: LineDataMapType = {};

    _animation: ?WebAnimation;

    constructor(options: OptionsType = {}) {
        const params = { ...DEFAULT_CONSTRUCTOR_PARAMS, ...options };

        this._data = params.data;
        this._visibilityMap = params.visibilityMap;
        this._navigationScope = params.navigationScope;

        this._width = params.width;
        this._height = params.height;
        this._devicePixelRatio = params.devicePixelRatio;
        this._verticalPaddingRatio = params.verticalPaddingRatio;
        this._lineWidth = params.lineWidth;

        this._canvasWidth = Math.round(this._devicePixelRatio * this._width);
        this._canvasHeight = Math.round(this._devicePixelRatio * this._height);
        this._verticalPadding = this._canvasHeight * this._verticalPaddingRatio / 2;

        this._animation = new WebAnimation({
            duration: params.animationDuration,
            easing: easingOutSine,
        });

        this._initCanvas();
        this._initData();
        this._draw();
    }

    _initCanvas() {
        this._canvas = document.createElement('canvas');
        this._canvas.width = this._canvasWidth;
        this._canvas.height = this._canvasHeight;

        this._context = this._canvas.getContext('2d');
        this._context.lineJoin = 'bevel';
        this._context.lineCap = 'butt';
        this._context.lineWidth = this._devicePixelRatio * this._lineWidth;
    }

    _initData() {
        const scope = this._getGraphScope();
        this._data.lines.forEach((chartLine: ChartLineType) => {
            this._lineDataMap[chartLine.key] = {
                scope: { ...scope },
                opacity: 1,
            };
        });
    }

    setNavigationScope(navigationScope: NavigationScopeType): void {
        this._navigationScope = navigationScope;
        this._drawAnimation(this._getGraphScope());
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

    _drawAnimation(newScope: GraphScopeType) {
        this._animation.stop();

        const prevLineDataMap: LineDataMapType = this._getPrevLineDataMap();
        const isNotEmptyGraph = Object.entries(this._visibilityMap).some(([key, isVisible]) => isVisible);

        this._animation.setOnStep((progress) => {
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

            this._clear();
            this._draw();
        });
        this._animation.run();
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

        this._data.lines.forEach((chartLine: ChartLineType) => {
            this._drawLine(chartLine, scaleX, shiftX, beginI, endI);
        });
    }

    _clear(): void {
        this._context.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
    }

    _drawLine(chartLine: ChartLineType, scaleX: number, shiftX: number, beginI: number, endI: number) {
        const lineData = this._lineDataMap[chartLine.key];


        const context = this._context;
        context.save();
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
            const y = this._canvasHeight - this._verticalPadding - (value - lineData.scope.minValue) * lineData.scope.scaleY;

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
