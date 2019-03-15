//@flow

import GraphCanvas from '../Graph/CanvasGraph';
import BaseComponent from '../Base/BaseComponent';
import DocumentHelper from '../../Utils/DocumentHelper';

import type { NavigationInterface, NavigationScopeType } from './NavigationInterface';
import type { ChartDataType, ChartLineType } from '../Chart';
import type { GraphInterface } from '../Graph/GraphInterface';
import type { VisibilityMapType } from '../Legend/LegendInterface';

import './Navigation.scss';

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

    _moveScrollData: ?MoveScrollDataType;

    _scrollData: ScrollDataType = { left: 0, right: 0, center: 0, width: 0 };
    _callbackOnChangeNavigationScope: Function = () => {};
    _navigationScope: NavigationScopeType = {};

    constructor(chartData: ChartDataType) {
        super();
        this._data = chartData;
        this._initData();
    }

    _initData() {
        this._navigationScope = {
            minValue: this._data.minValue,
            maxValue: this._data.maxValue,
            minX: 0,
            maxY: this._data.x.length - 1,
        };
    }

    _updateNavigationScope(visibilityMap: VisibilityMapType) {
        //this._data.lines
    }

    setVisibilityMap(visibilityMap: VisibilityMapType): void {
        this._updateVerticalScope(visibilityMap);

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

    _updateVerticalScope(visibilityMap: ?VisibilityMapType = null): void {
        const verticalScope = this._data.lines.reduce((result: {}, chartLine: ChartLineType) => {
            if (visibilityMap && !visibilityMap[chartLine.key]) {
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

        this._navigationScope.minValue = verticalScope.minValue;
        this._navigationScope.maxValue = verticalScope.maxValue;
        this._navigationScopeDidUpdate();
    }

    _updateHorizontalScope(): void {
        this._navigationScope.minX = Math.round(
            this._scrollData.left / this._scrollData.width * (this._data.x.length - 1),
        );
        this._navigationScope.maxX = Math.round(
            (this._scrollData.width - this._scrollData.right) / this._scrollData.width * (this._data.x.length - 1),
        );
        this._navigationScopeDidUpdate();
    }

    _navigationScopeDidUpdate(): void {
        this._callbackOnChangeNavigationScope(this.getNavigationScope());
    }

    render(container: HTMLElement) {
        const divNavigation: HTMLDivElement = document.createElement('div');
        divNavigation.classList.add('Navigation');
        container.appendChild(divNavigation);

        const width = divNavigation.clientWidth;
        const height = divNavigation.clientHeight;

        this._scrollData.width = width;
        this._scrollData.minWidth = Math.round(width * SCROLL_CENTER_MIN_RATIO);

        this._graph = new GraphCanvas(this._data, {
            width,
            height,
            minValue: this._navigationScope.minValue,
            maxValue: this._navigationScope.maxValue,
        });
        const graphElement = this._graph.getGraphElement();
        graphElement.classList.add('Navigation-Graph');
        divNavigation.appendChild(graphElement);

        this._divShadowLeft = document.createElement('div');
        this._divShadowLeft.classList.add('Navigation-Shadow-Left');
        divNavigation.appendChild(this._divShadowLeft);

        this._divShadowRight = document.createElement('div');
        this._divShadowRight.classList.add('Navigation-Shadow-Right');
        divNavigation.appendChild(this._divShadowRight);

        this._divScroll = document.createElement('div');
        this._divScroll.classList.add('Navigation-Scroll');
        divNavigation.appendChild(this._divScroll);

        const divScrollLeft: HTMLDivElement = document.createElement('div');
        divScrollLeft.classList.add('Navigation-Scroll-Left');
        this._divScroll.appendChild(divScrollLeft);

        const divScrollRight: HTMLDivElement = document.createElement('div');
        divScrollRight.classList.add('Navigation-Scroll-Right');
        this._divScroll.appendChild(divScrollRight);

        this._addScrollEvents(this._divScroll, divScrollLeft, divScrollRight);
    }

    _addScrollEvents(divScroll: HTMLDivElement, divScrollLeft: HTMLDivElement, divScrollRight: HTMLDivElement) {
        this.addEventListener(divScrollLeft, ['touchstart', 'mousedown'], (event: TouchEvent) => {
            this._onTouchStartScroll(event, MOVE_SCROLL_TYPE_LEFT);
        });
        this.addEventListener(divScrollRight, ['touchstart', 'mousedown'], (event: TouchEvent) => {
            this._onTouchStartScroll(event, MOVE_SCROLL_TYPE_RIGHT);
        });
        this.addEventListener(divScroll, ['touchstart', 'mousedown'], (event: TouchEvent) => {
            this._onTouchStartScroll(event, MOVE_SCROLL_TYPE_CENTER);
        });
        this.addEventListener(document, ['touchmove', 'mousemove'], this._onTouchMoveScroll.bind(this));
        this.addEventListener(document, ['touchend', 'touchcancel', 'mouseup'], this._onTouchEndScroll.bind(this));
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
        }
    }

    _onTouchEndScroll() {
        this._moveScrollData = null;
    }


}
