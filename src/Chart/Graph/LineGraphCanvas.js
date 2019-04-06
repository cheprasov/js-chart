// @flow

import WebAnimation from '@cheprasov/web-animation';
import type { ProgressType } from '@cheprasov/web-animation/src/WebAnimation';

import ScreenUtils from '../../Utils/ScreenUtils';
import { easingOutSine } from '../../Utils/Easing';

import type { GraphInterface } from './GraphInterface';
import type { ChartDataType, ChartLineType } from '../Chart';
import type { VisibilityMapType } from '../Legend/LegendInterface';
import type { NavigationScopeType } from '../Navigation/NavigationInterface';
import FunctionUtils from '../../Utils/FunctionUtils';

export type GraphScopeType = {
    maxValue: ?number,
    minValue: ?number,
    scaleX: ?number,
    scaleY: ?number,
}

export type LineDataType = {
    scope: GraphScopeType,
    opacity: number,
};

export type LineDataMapType = {
    [string]: LineDataType
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
    _animationDuration: number;

    _canvas: HTMLCanvasElement;
    _context: CanvasRenderingContext2D;
    _canvasWidth: number;
    _canvasHeight: number;

    // separate scope for each line is because different animation on task mock
    _lineDataMap: LineDataMapType;
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
        this._renderQualityRatio = Math.min(1, Math.max(0.1, params.renderQualityRatio));
        this._lineWidth = params.lineWidth;
        this._animationDuration = params.animationDuration;

        this._canvasWidth = Math.round(this._getCanvasValue(this._width));
        this._canvasHeight = Math.round(this._getCanvasValue(this._height));
        this._verticalPadding = this._canvasHeight * this._verticalPaddingRatio / 2;

        this._onAnimationEnd = this._onAnimationEnd.bind(this);
        //this._drawAnimation = FunctionUtils.debounce(this._drawAnimation.bind(this), 100);
    }

    _init() {
        this._initCanvas();
        this._initLineDataMap();
    }

    _initCanvas() {
        this._canvas = document.createElement('canvas');
        this._canvas.width = this._canvasWidth;
        this._canvas.height = this._canvasHeight;

        this._context = this._canvas.getContext('2d');
        this._context.lineJoin = 'bevel';
        this._context.lineCap = 'butt';
        this._context.font = `${this._getCanvasValue(16)}px Arial`;
    }

    _createAnimation() {
        if (this._animation) {
            this._animation.stop();
        }
        this._animation = new WebAnimation({
            duration: this._animationDuration,
            easing: easingOutSine,
            onFinish: this._onAnimationEnd,
        });
    }

    _getCanvasValue(value: number) {
        // todo: think about it
        return ((this._devicePixelRatio - 1) * this._renderQualityRatio + 1) * value;
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
        this._createAnimation();

        const prevLineDataMap: LineDataMapType = this._getPrevLineDataMap();
        const isNotEmptyGraph = Object.values(this._visibilityMap).some((isVisible: boolean) => isVisible);

        this._animation.setOnStep((progress: ProgressType) => {
            this._drawLinesAnimation(progress, newScope, prevLineDataMap, isNotEmptyGraph);
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

    _onAnimationEnd() {
    }

    _getGraphScope(): GraphScopeType {
        return {
            minValue: this._navigationScope.minValueSlice,
            maxValue: this._navigationScope.maxValueSlice,
            scaleY: this._canvasHeight * (1 - this._verticalPaddingRatio)
                / ((this._navigationScope.maxValueSlice - this._navigationScope.minValueSlice) || 1),
        };
    }

    _getScaleX(): number {
        return this._canvasWidth / (this._navigationScope.maxXRatio - this._navigationScope.minXRatio)
            / this._data.maxIndex;
    }

    _getShiftX(): number {
        return this._canvasWidth / (this._navigationScope.maxXRatio - this._navigationScope.minXRatio)
            * this._navigationScope.minXRatio;
    }

    getGraphElement(): HTMLCanvasElement {
        this._init();
        this._draw();
        return this._canvas;
    }

    _draw(): void {
        this._clear();
        const minXRatio = this._navigationScope.minXRatio;
        const maxXRatio = this._navigationScope.maxXRatio;

        const beginI = Math.floor(this._data.maxIndex * minXRatio);
        const endI = Math.ceil(this._data.maxIndex * maxXRatio);

        this._data.lines.forEach((chartLine: ChartLineType) => {
            this._drawLine(chartLine, this._getScaleX(), this._getShiftX(), beginI, endI);
        });
    }

    _clear(): void {
        this._context.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
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
