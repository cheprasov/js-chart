// @flow

import type { ProgressType } from '@cheprasov/web-animation/src/WebAnimation';

import LineGraphCanvas from './LineGraphCanvas';

import type { ChartLineType } from '../Chart';
import type { NavigationScopeType } from '../Navigation/NavigationInterface';
import type { AxisYGeneratorInterface, AxisYItemType } from './Axis/AxisYGeneratorInterface';
import type { AxisXGeneratorInterface, AxisXItemType } from './Axis/AxisXGeneratorInterface';
import type { GraphScopeType, LineDataMapType, LineDataType } from './LineGraphCanvas';
import type { ViewerGraphInterface } from './ViewerGraphInterface';


type AxisYDataType = {
    hash: string,
    items: AxisYItemType[],
    scope: GraphScopeType,
    opacity: number,
}

type AxisYDataMapType = {
    [string]: AxisYDataType
};

type AxisXOpacityMapType = {
    [number]: number
};

export type OptionsType = {
    axisYGenerator?: AxisYGeneratorInterface,
    axisXGenerator?: AxisXGeneratorInterface,
}

const DEFAULT_CONSTRUCTOR_PARAMS = {
    axisYGenerator: null,
    axisXGenerator: null,
};

export const GRAPH_AXIS_X_TEXT_WIDTH = 80;

const GRAPH_AXIS_X_TOP: number = 8;

export default class LineViewerGraphCanvas extends LineGraphCanvas implements ViewerGraphInterface {

    _axisYGenerator: AxisYGeneratorInterface | null = null;
    _axisXGenerator: AxisXGeneratorInterface | null = null;

    _axisYDataMap: AxisYDataMapType;
    _axisYHash: string;
    _axisXOpacityMap: AxisXOpacityMapType;

    _selectedIndex: null | number = null;

    constructor(options: OptionsType = {}) {
        super(options);
        const params = { ...DEFAULT_CONSTRUCTOR_PARAMS, ...options };
        this._axisYGenerator = params.axisYGenerator;
        this._axisXGenerator = params.axisXGenerator;
    }

    _init() {
        super._init();
        this._initAxisYDataMap();
        this._initAxisXDataMap();
    }

    selectIndexByRatio(ratio: number): null | number {
        const index = Math.round(
            ((this._navigationScope.maxXRatio - this._navigationScope.minXRatio) * ratio + this._navigationScope.minXRatio)
            * this._data.maxIndex,
        );
        this._selectedIndex = index;
        this._draw();

        return index;
    }

    unselectIndex(): void {
        this._selectedIndex = null;
        this._draw();
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

    _initAxisXDataMap() {
        if (!this._axisXGenerator) {
            return;
        }
        const mod = this._axisXGenerator.getMod();
        this._axisXOpacityMap = { [mod]: 1 };
    }

    setNavigationScope(navigationScope: NavigationScopeType): void {
        this._navigationScope = navigationScope;
        if (this._axisYGenerator) {
            const prevAxisYHash = this._axisYHash;
            const prevAxisXMod = this._axisXGenerator.getMod();
            this._axisYGenerator.setNavigationScope(navigationScope);
            this._axisXGenerator.setNavigationScope(navigationScope);
            this._updateAxisYData(prevAxisYHash);
            this._updateAxisXData(prevAxisXMod);
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

    _updateAxisXData(prevMod: number) {
        const currentMod = this._axisXGenerator.getMod();
        if (prevMod === currentMod) {
            return;
        }
        this._axisXOpacityMap[currentMod] = currentMod >= prevMod ? 1 : 0;
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

    _getPrevAxisXDataMap(): AxisXOpacityMapType {
        return { ...this._axisXOpacityMap };
    }

    _drawAnimation(newScope: GraphScopeType) {
        this._animation.stop();

        const prevLineDataMap: LineDataMapType = this._getPrevLineDataMap();
        const prevAxisYDataMap: AxisYDataMapType = this._getPrevAxisYDataMap();
        const prevAxisXDataMap: AxisXOpacityMapType = this._getPrevAxisXDataMap();
        const isNotEmptyGraph = Object.values(this._visibilityMap).some((isVisible: boolean) => isVisible);

        this._animation.setOnStep((progress: ProgressType) => {
            this._drawLinesAnimation(progress, newScope, prevLineDataMap, isNotEmptyGraph);
            this._drawAxisYAnimation(progress, newScope, prevAxisYDataMap, isNotEmptyGraph);
            this._drawAxisXAnimation(progress, prevAxisXDataMap);
            this._draw();
        });

        this._animation.run();
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

    _drawAxisXAnimation(progress: ProgressType, prevAxisXOpacityMap: AxisXOpacityMapType): void {
        const currentMod = this._axisXGenerator.getMod();
        Object.keys(this._axisXOpacityMap).forEach((mod: number) => {
            const prevOpacity: number = prevAxisXOpacityMap[mod];
            const opacity = Number(mod) >= currentMod ? 1 : 0;
            this._axisXOpacityMap[mod] = (opacity - prevOpacity) * progress.tween + prevOpacity;
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

    _draw(): void {
        this._clear();
        const minXRatio = this._navigationScope.minXRatio;
        const maxXRatio = this._navigationScope.maxXRatio;

        //const scaleX = this._canvasWidth / (this._data.maxIndex * (maxXRatio - minXRatio));
        const scaleX = this._getScaleX();
        const shiftX = this._getShiftX();

        const beginI = Math.floor(this._data.maxIndex * minXRatio);
        const endI = Math.ceil(this._data.maxIndex * maxXRatio);

        this._drawAxisYLines();
        this._data.lines.forEach((chartLine: ChartLineType) => {
            this._drawLine(chartLine, scaleX, shiftX, beginI, endI);
        });
        this._drawAxisYText();
        this._drawAxisXTitles(scaleX, shiftX, beginI, endI);
        this._drawSelectedIndex(scaleX, shiftX, beginI, endI);
    }

    _drawAxisXTitles(scaleX: number, shiftX: number, beginI: number, endI: number) {
        const items: AxisXItemType[] = this._axisXGenerator.getAxisXItems();

        const context = this._context;
        context.save();
        //context.textAlign = 'center';
        context.translate(0, this._canvasHeight - this._verticalPadding);

        const mods = Object.keys(this._axisXOpacityMap).map(Number).sort((a, b) => b - a);
        const y = this._getCanvasValue(18);

        const beginIndex = Math.max(0, beginI - this._axisXGenerator.getMod());

        for (let index = beginIndex; index <= endI; index += 1) {
            const item: AxisXItemType = items[index];
            const x = item.index * scaleX - shiftX;

            mods.some((mod: number) => {
                if (index % mod !== 0) {
                    return false;
                }
                context.globalAlpha = this._axisXOpacityMap[mod];
                context.fillText(item.title, x, y);
                return true;
            });
        }

        context.restore();
    }

    _drawSelectedIndex(scaleX: number, shiftX: number) {
        if (this._selectedIndex === null) {
            return;
        }

        const index = this._selectedIndex;
        const x = index * scaleX - shiftX;

        const context = this._context;
        context.save();
        context.translate(0, this._canvasHeight - this._verticalPadding);

        context.strokeStyle = '#dfe6eb';
        context.lineWidth = this._getCanvasValue(1);

        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, -this._canvasHeight + this._verticalPadding);
        context.stroke();

        context.lineWidth = this._getCanvasValue(this._lineWidth);
        context.fillStyle = '#ffffff';

        const radius: number = context.lineWidth * 2;

        this._data.lines.forEach((chartLine: ChartLineType) => {
            const lineData: LineDataType = this._lineDataMap[chartLine.key];
            context.strokeStyle = chartLine.color;
            context.globalAlpha = lineData.opacity;

            const minValue = lineData.scope.minValue;
            const scaleY = lineData.scope.scaleY;
            const value = chartLine.values[index];
            const y = -(value - minValue) * scaleY;

            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI);
            context.fill();
            context.stroke();
        });

        //context.stroke();
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

                context.fillText(item.title, 0, y - this._getCanvasValue(GRAPH_AXIS_X_TOP));
            });
        });
        context.restore();
    }
}