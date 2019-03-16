// @flow

import WebAnimation from '@cheprasov/web-animation';
import DisplayUtils from '../../Utils/DisplayUtils';

import type { GraphInterface, VerticalScopeType } from './GraphInterface';
import type { ChartDataType, ChartLineType } from '../Chart';
import type { VisibilityMapType } from '../Legend/LegendInterface';

type GraphScopeType = {
    maxValue: ?number,
    minValue: ?number,
    scaleX: ?number,
    scaleY: ?number,
}

type LineDataType = {
    scope: GraphScopeType,
    opacity: number,
};

type LineDataMapType = {
    [string]: LineDataType,
};

type OptionsType = {
    data: ChartDataType,
    visibilityMap: VisibilityMapType,
    minValue: number,
    maxValue: number,
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
    minValue: 0,
    maxValue: 0,
    width: 100,
    height: 50,
    devicePixelRatio: DisplayUtils.getDevicePixelRatio() * 0.75,
    verticalPaddingRatio: 0.1, // 10%
    animationDuration: 200,
    lineWidth: 1.5,
};

export default class GraphCanvas implements GraphInterface {

    _data: ChartDataType;
    _visibilityMap: VisibilityMapType;
    _devicePixelRatio: number;
    _width: number;
    _height: number;
    _verticalPaddingRatio: number;
    _lineWidth: number;

    _canvas: HTMLCanvasElement;
    _context: CanvasRenderingContext2D;
    _canvasWidth: number;
    _canvasHeight: number;

    _verticalPadding: number;

    _verticalScope: VerticalScopeType;
    // separate scope for each line is because different animation on task mock
    _lineDataMap: LineDataMapType = {};

    _animation: ?WebAnimation;

    constructor(options: OptionsType = {}) {
        const params = { ...DEFAULT_CONSTRUCTOR_PARAMS, ...options };

        this._data = params.data;
        this._visibilityMap = params.visibilityMap;
        this._verticalScope = { minValue: params.minValue, maxValue: params.maxValue };
        this._width = params.width;
        this._height = params.height;
        this._devicePixelRatio = params.devicePixelRatio;
        this._verticalPaddingRatio = params.verticalPaddingRatio;
        this._lineWidth = params.lineWidth;

        this._canvasWidth = Math.round(this._devicePixelRatio * this._width);
        this._canvasHeight = Math.round(this._devicePixelRatio * this._height);
        this._verticalPadding = this._canvasHeight * this._verticalPaddingRatio / 2;

        this._animation = new WebAnimation({ duration: params.animationDuration });

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

    setVerticalScope(verticalScope: VerticalScopeType): void {
        this._verticalScope = verticalScope;
    }

    setVisibilityMap(visibilityMap: VisibilityMapType): void {
        this._visibilityMap = visibilityMap;
        this._drawAnimation(this._getGraphScope());
    }

    _drawAnimation(newScope: GraphScopeType) {
        this._animation.stop();

        const prevLineDataMap: LineDataMapType = {};
        Object.entries(this._lineDataMap).forEach(([key, lineData]) => {
            prevLineDataMap[key] = {
                opacity: lineData.opacity,
                scope: { ...lineData.scope },
            };
        });

        this._animation.setOnStep((progress) => {
            Object.entries(this._lineDataMap).forEach(([key, lineData]) => {
                const isVisible = this._visibilityMap[key];
                const oldOpacity: number = prevLineDataMap[key].opacity;
                const oldScope = prevLineDataMap[key].scope;
                if (isVisible) {
                    if (oldOpacity) {
                        lineData.scope = {
                            maxValue: (newScope.maxValue - oldScope.maxValue) * progress.tween + oldScope.maxValue,
                            minValue: (newScope.minValue - oldScope.minValue) * progress.tween + oldScope.minValue,
                            scaleX: (newScope.scaleX - oldScope.scaleX) * progress.tween + oldScope.scaleX,
                            scaleY: (newScope.scaleY - oldScope.scaleY) * progress.tween + oldScope.scaleY,
                        };
                    } else {
                        lineData.scope = { ...newScope };
                    }
                }
                const opacity = isVisible ? 1 : 0;
                lineData.opacity = (opacity - oldOpacity) * progress.tween + oldOpacity;
            });

            this._clear();
            this._draw();
        });
        this._animation.run();
    }

    _getGraphScope(): GraphScopeType {
        return {
            ...this._verticalScope,
            scaleX: this._canvasWidth / Math.max(this._data.x.length - 1, 1),
            scaleY: this._canvasHeight * (1 - this._verticalPaddingRatio)
                / ((this._verticalScope.maxValue - this._verticalScope.minValue) || 1),
        };
    }

    getGraphElement(): HTMLCanvasElement {
        return this._canvas;
    }

    _draw(): void {
        this._data.lines.forEach((chartLine: ChartLineType) => {
            this._drawLine(chartLine);
        });
    }

    _clear(): void {
        this._context.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
    }

    _drawLine(chartLine: ChartLineType) {
        const lineData = this._lineDataMap[chartLine.key];

        const context = this._context;
        context.save();
        context.strokeStyle = chartLine.color;
        context.globalAlpha = lineData.opacity;

        context.beginPath();
        chartLine.values.forEach((value: number, index: number) => {
            const x = index * lineData.scope.scaleX;
            const y = this._canvasHeight - this._verticalPadding - (value - lineData.scope.minValue)
                * lineData.scope.scaleY;

            if (index) {
                context.lineTo(x, y);
            } else {
                context.moveTo(x, y);
            }
        });
        context.stroke();
        context.restore();
    }

}