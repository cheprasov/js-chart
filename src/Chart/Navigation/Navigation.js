//@flow

import GraphCanvas from '../Graph/CanvasGraph';
import BaseComponent from '../Base/BaseComponent';
import DocumentHelper from '../../Utils/DocumentHelper';

import type { NavigationInterface, NavigationScopeType } from './NavigationInterface';
import type { ChartDataType, ChartLineType } from '../Chart';
import type { GraphInterface } from '../Graph/GraphInterface';
import type { VisibilityMapType } from '../Legend/LegendInterface';

import './Navigation.scss';
import type { MinMaxValueType } from '../../Utils/ArrayUtils';
import ArrayUtils from '../../Utils/ArrayUtils';
import DisplayUtils from '../../Utils/DisplayUtils';

const SCROLL_CENTER_MIN_RATIO = 0.15; // 15%

const MOVE_SCROLL_TYPE_CENTER = 1;
const MOVE_SCROLL_TYPE_LEFT = 2;
const MOVE_SCROLL_TYPE_RIGHT = 3;

type MoveTypeType = MOVE_SCROLL_TYPE_CENTER | MOVE_SCROLL_TYPE_LEFT | MOVE_SCROLL_TYPE_RIGHT;

type ScrollDataType = {
    left: number,
    right: number,
    center: number,
    width: number,
    minWidth: number,
}

type MoveScrollDataType = {
    type: MoveTypeType,
    data: ScrollDataType,
    clientX: number,
}

export default class Navigation extends BaseComponent implements NavigationInterface {

    _data: ChartDataType;
    _graph: GraphInterface;

    _divShadowLeft: ?HTMLDivElement;
    _divShadowRight: ?HTMLDivElement;
    _divScroll: ?HTMLDivElement;

    _visibilityMap: VisibilityMapType;

    _moveScrollData: ?MoveScrollDataType;
    _scrollData: ScrollDataType = { left: 0, right: 0, center: 0, width: 0 };
    _callbackOnChangeNavigationScope: Function = () => {};
    _navigationScope: NavigationScopeType;

    constructor(chartData: ChartDataType, visibilityMap: VisibilityMapType) {
        super();
        this._data = chartData;
        this._visibilityMap = visibilityMap;
        this._initData();
    }

    _initData() {
        this._navigationScope = {
            minValue: this._data.minValue,
            maxValue: this._data.maxValue,
            minXIndex: 0,
            maxXIndex: this._data.x.length - 1,
            minValueSlice: this._data.minValue,
            maxValueSlice: this._data.maxValue,
        };
    }

    setVisibilityMap(visibilityMap: VisibilityMapType): void {
        this._visibilityMap = visibilityMap;

        this._updateVerticalScope();

        if (this._graph) {
            this._graph.setVerticalScope({
                minValue: this._navigationScope.minValue,
                maxValue: this._navigationScope.maxValue,
            });
            this._graph.setVisibilityMap(visibilityMap);
        }
    }

    setCallbackOnChangeNavigationScope(callback: Function): NavigationScopeType {
        this._callbackOnChangeNavigationScope = callback;
    }

    getNavigationScope(): NavigationScopeType {
        return { ...this._navigationScope };
    }

    _updateVerticalScope(): void {
        const verticalScope = this._data.lines.reduce((result: {}, chartLine: ChartLineType) => {
            if (!this._visibilityMap[chartLine.key]) {
                // skip invisible lines
                return result;
            }

            result.minValue = result.minValue === null
                ? chartLine.minValue
                : Math.min(result.minValue, chartLine.minValue);

            result.maxValue = result.maxValue === null
                ? chartLine.maxValue
                : Math.max(result.maxValue, chartLine.maxValue);

            return result;
        }, { maxValue: null, minValue: null });

        if (this._navigationScope.minValue !== verticalScope.minValue
            || this._navigationScope.maxValue !== verticalScope.maxValue) {
            this._navigationScope.minValue = verticalScope.minValue;
            this._navigationScope.maxValue = verticalScope.maxValue;

            this._updateVerticalSliceScope();
            this._navigationScopeDidUpdate();
        }
    }

    _updateHorizontalScope(): void {
        const minXIndex = Math.round(this._scrollData.left / this._scrollData.width * (this._data.x.length - 1));
        const maxXIndex = Math.round(
            (this._scrollData.width - this._scrollData.right) / this._scrollData.width * (this._data.x.length - 1),
        );
        if (this._navigationScope.minXIndex !== minXIndex || this._navigationScope.maxXIndex !== maxXIndex) {
            this._navigationScope.minXIndex = minXIndex;
            this._navigationScope.maxXIndex = maxXIndex;

            this._updateVerticalSliceScope();
            this._navigationScopeDidUpdate();
        }
    }

    _updateVerticalSliceScope() {
        const values: number[][] = this._data.lines.map((line: ChartLineType) => line.values);
        const minMaxValue: MinMaxValueType = ArrayUtils.getMinMaxValueBySliceArrays(
            values,
            this._navigationScope.minXIndex,
            this._navigationScope.maxXIndex,
        );
        this._navigationScope.minValueSlice = minMaxValue.minValue;
        this._navigationScope.maxValueSlice = minMaxValue.maxValue;
    }

    _navigationScopeDidUpdate(): void {
        this._callbackOnChangeNavigationScope(this.getNavigationScope());
    }

    render(container: HTMLElement) {
        const divNavigation: HTMLDivElement = DocumentHelper.createDivElement('Navigation', container);

        const width = divNavigation.clientWidth;
        const height = divNavigation.clientHeight;

        this._scrollData.width = width;
        this._scrollData.minWidth = Math.round(width * SCROLL_CENTER_MIN_RATIO);

        this._graph = new GraphCanvas({
            data: this._data,
            visibilityMap: this._visibilityMap,
            width,
            height,
            minValue: this._navigationScope.minValue,
            maxValue: this._navigationScope.maxValue,
        });

        const graphElement = this._graph.getGraphElement();
        graphElement.classList.add('Navigation-Graph');
        divNavigation.appendChild(graphElement);

        const touchScreen = DisplayUtils.isTouchScreen() ? 'TouchScreen' : null;

        this._divShadowLeft = DocumentHelper.createDivElement('Navigation-Shadow-Left', divNavigation);
        this._divShadowRight = DocumentHelper.createDivElement('Navigation-Shadow-Right', divNavigation);
        this._divScroll = DocumentHelper.createDivElement('Navigation-Scroll', divNavigation);
        const divScrollLeft: HTMLDivElement = DocumentHelper.createDivElement(
            ['Navigation-Scroll-Left', touchScreen || null],
            this._divScroll,
        );
        const divScrollRight:HTMLDivElement = DocumentHelper.createDivElement(
            ['Navigation-Scroll-Right', touchScreen || null],
            this._divScroll,
        );

        this._addScrollEvents(this._divScroll, divScrollLeft, divScrollRight);
    }

    _addScrollEvents(divScroll: HTMLDivElement, divScrollLeft: HTMLDivElement, divScrollRight: HTMLDivElement) {
        const eventStartType = DisplayUtils.isTouchScreen() ? 'touchstart' : 'mousedown';
        const eventMoveType = DisplayUtils.isTouchScreen() ? 'touchmove' : 'mousemove';
        const eventEndType = DisplayUtils.isTouchScreen() ? ['touchend', 'touchcancel'] : 'mouseup';

        this.addEventListener(divScrollLeft, eventStartType, (event: TouchEvent) => {
            this._onTouchStartScroll(event, MOVE_SCROLL_TYPE_LEFT);
        });
        this.addEventListener(divScrollRight, eventStartType, (event: TouchEvent) => {
            this._onTouchStartScroll(event, MOVE_SCROLL_TYPE_RIGHT);
        });
        this.addEventListener(divScroll, eventStartType, (event: TouchEvent) => {
            this._onTouchStartScroll(event, MOVE_SCROLL_TYPE_CENTER);
        });
        this.addEventListener(document, eventMoveType, this._onTouchMoveScroll.bind(this));
        this.addEventListener(document, eventEndType, this._onTouchEndScroll.bind(this));
    }

    _onTouchStartScroll(event: TouchEvent, scrollType: MoveTypeType) {
        let clientX;

        if (event.touches) {
            if (!event.touches || event.touches.length !== 1) {
                return;
            }
            clientX = event.touches[0].clientX;
        } else if (event instanceof MouseEvent) {
            clientX = event.clientX;
        }

        this._moveScrollData = {
            data: { ...this._scrollData },
            type: scrollType,
            clientX,
        };

        if (event.cancelable) {
            event.preventDefault();
        }
        event.stopPropagation();
    }

    _onTouchMoveScroll(event: TouchEvent) {
        if (!this._moveScrollData) {
            return;
        }

        let clientX;
        if (event.touches) {
            clientX = event.touches[0].clientX;
        } else if (event instanceof MouseEvent) {
            clientX = event.clientX;
        }

        const shiftX = Math.round(clientX - this._moveScrollData.clientX);

        let isLeftUpdated: boolean = false;
        let isRightUpdated: boolean = false;

        if (this._moveScrollData.type === MOVE_SCROLL_TYPE_LEFT) {
            const left = Math.min(
                Math.max(0, this._moveScrollData.data.left + shiftX),
                this._moveScrollData.data.width - this._moveScrollData.data.right - this._moveScrollData.data.minWidth,
            );
            if (this._scrollData.left !== left) {
                this._scrollData.left = left;
                isLeftUpdated = true;
            }
        }

        if (this._moveScrollData.type === MOVE_SCROLL_TYPE_RIGHT) {
            const right = Math.min(
                Math.max(0, this._moveScrollData.data.right - shiftX),
                this._moveScrollData.data.width - this._moveScrollData.data.left - this._moveScrollData.data.minWidth,
            );
            if (this._scrollData.right !== right) {
                this._scrollData.right = right;
                isRightUpdated = true;
            }
        }

        if (this._moveScrollData.type === MOVE_SCROLL_TYPE_CENTER) {
            const center = (this._moveScrollData.data.width - this._moveScrollData.data.left
                - this._moveScrollData.data.right);
            const left = Math.min(
                Math.max(0, this._moveScrollData.data.left + shiftX),
                this._moveScrollData.data.width - center,
            );
            const right = this._moveScrollData.data.width - left - center;
            if (this._scrollData.left !== left) {
                this._scrollData.left = left;
                this._scrollData.right = right;
                isLeftUpdated = true;
                isRightUpdated = true;
            }
        }

        if (isLeftUpdated || isRightUpdated) {
            DocumentHelper.update(() => {
                if (isLeftUpdated) {
                    this._divShadowLeft.style.width = `${this._scrollData.left}px`;
                    this._divScroll.style.left = `${this._scrollData.left}px`;
                }
                if (isRightUpdated) {
                    this._divShadowRight.style.width = `${this._scrollData.right}px`;
                    this._divScroll.style.right = `${this._scrollData.right}px`;
                }
            });

            this._updateHorizontalScope();
            this._updateVerticalSliceScope();
        }
    }

    _onTouchEndScroll() {
        this._moveScrollData = null;
    }


}
