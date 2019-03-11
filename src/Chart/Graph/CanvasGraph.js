// @flow

import DisplayUtils from '../../Utils/DisplayUtils';

import type { GraphInterface } from './GraphInterface';
import type { ChartDataType, ChartLineType } from '../Chart';
import type { VisibilityMapType } from '../Legend/LegendInterface';

type OptionsType = {
    devicePixelRatio?: number,
    width: number,
    height: number,
}

type BoundsType = {
    max: ?number,
    min: ?number,
    scaleX: ?number,
    scaleY: ?number,
}

const DEFAULT_CONSTRUCTOR_PARAMS = {
    devicePixelRatio: DisplayUtils.getDevicePixelRatio(),
    width: 100,
    height: 50,
    verticalPaddingRatio: 0.9,
};

export default class GraphCanvas implements GraphInterface {

    _data: ChartDataType;
    _devicePixelRatio: number;
    _width: number;
    _height: number;
    _verticalPaddingRatio: number;

    _canvas: HTMLCanvasElement;
    _context: CanvasRenderingContext2D;
    _canvasWidth: number;
    _canvasHeight: number;

    _visibilityMap: { [string]: boolean } = {};

    constructor(chartData: ChartDataType, options: OptionsType = {}) {
        const params = { ...DEFAULT_CONSTRUCTOR_PARAMS, ...options };
        this._data = chartData;
        this._devicePixelRatio = params.devicePixelRatio;
        this._width = params.width;
        this._height = params.height;
        this._verticalPaddingRatio = params.verticalPaddingRatio;

        this._canvasWidth = Math.round(this._devicePixelRatio * this._width);
        this._canvasHeight = Math.round(this._devicePixelRatio * this._height);

        this._initCanvas();
        this._initData();
        this._initDraw();
    }

    _initCanvas() {
        this._canvas = document.createElement('canvas');
        this._context = this._canvas.getContext('2d');
        this._canvas.width = this._canvasWidth;
        this._canvas.height = this._canvasHeight;
        this._canvas.style.width = `${this._width}px`;
        this._canvas.style.height = `${this._height}px`;
    }

    _initData() {
        this._data.lines.forEach((chartLine: ChartLineType) => {
            this._visibilityMap[chartLine.key] = true;
        });
    }

    setVisibilityMap(visibilityMap: VisibilityMapType): void {
        Object.keys(this._visibilityMap).forEach((key: string) => {
            this._visibilityMap[key] = !!visibilityMap[key];
        });
        this._clear();
        this._initDraw();
    }

    _getVisibleLines(): ChartLineType[] {
        return this._data.lines.filter((chartLine: ChartLineType) => {
            return this._visibilityMap[chartLine.key] === true;
        });
    }

    _getBounds(): BoundsType {
        const bounds = this._getVisibleLines().reduce((result: {}, chartLine: ChartLineType) => {
            result.min = result.min === null ? chartLine.minValue : Math.min(result.min, chartLine.minValue);
            result.max = result.max === null ? chartLine.maxValue : Math.max(result.max, chartLine.maxValue);
            return result;
        }, {
            max: null,
            min: null,
        });
        bounds.scaleY = this._canvasHeight * this._verticalPaddingRatio / ((bounds.max - bounds.min) || 1);
        bounds.scaleX = this._canvasWidth / Math.max(this._data.x.length - 1, 1);

        return bounds;
    }

    getGraphElement(): HTMLCanvasElement {
        return this._canvas;
    }

    _initDraw(): void {
        const bounds = this._getBounds();
        this._data.lines.forEach((chartLine: ChartLineType) => {
            if (this._visibilityMap[chartLine.key]) {
                this._drawLine(chartLine, bounds);
            }
        });
    }

    _clear(): void {
        this._context.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
    }

    _drawLine(chartLine: ChartLineType, bounds: BoundsType) {
        const context = this._context;
        context.lineJoin = 'bevel';
        context.lineCap = 'butt';
        context.lineWidth = this._devicePixelRatio * 1.5;
        context.strokeStyle = chartLine.color;

        const verticalPadding = this._canvasHeight * (1 - this._verticalPaddingRatio) / 2;

        context.beginPath();
        chartLine.values.forEach((value: number, index: number) => {
            const x = index * bounds.scaleX;
            const y = this._canvasHeight - (value - bounds.min) * bounds.scaleY - verticalPadding;
            if (index) {
                context.lineTo(x, y);
            } else {
                context.moveTo(x, y);
            }
        });
        context.stroke();
    }

}
