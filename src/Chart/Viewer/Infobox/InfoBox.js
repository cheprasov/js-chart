// @flow

import BaseComponent from '../../Base/BaseComponent';
import DocumentHelper from '../../../Utils/DocumentHelper';
import DateUtils from '../../../Utils/DateUtils';
import VisibilityMap from '../../Legend/VisibilityMap/VisibilityMap';

import type { InfoBoxInterface } from './InfoBoxInterface';
import type { ChartDataType, ChartLineType } from '../../Chart';
import type { NavigationScopeType } from '../../Navigation/NavigationInterface';

import './InfoBox.scss';

type OptionsType = {
    data: ChartDataType,
    visibilityMap: VisibilityMap,
    navigationScope: NavigationScopeType,
};

const DEFAULT_CONSTRUCTOR_PARAMS: OptionsType = {
    data: null,
    visibilityMap: null,
};

type DivElementsType = {
    itemElement: HTMLElement,
    valueElement: HTMLElement,
    titleElement: HTMLElement,
}

type DivElementsMapType = {
    [string]: DivElementsType
}

export default class InfoBox extends BaseComponent implements InfoBoxInterface {

    _data: ChartDataType;
    _visibilityMap: VisibilityMap;
    _navigationScope: NavigationScopeType;

    _divElementsMap: DivElementsMapType = {};
    _divInfo: HTMLDivElement;
    _divDate: HTMLDivElement;
    _index: null | number = null;
    _callbackOnClose: Function = () => {};

    constructor(options: OptionsType) {
        super();
        const params = { ...DEFAULT_CONSTRUCTOR_PARAMS, ...options };
        this._data = params.data;
        this._visibilityMap = params.visibilityMap;
    }

    setVisibilityMap(visibilityMap: VisibilityMap): void {
        this._visibilityMap = visibilityMap;

        DocumentHelper.update(() => {
            this._data.lines.forEach((line: ChartLineType) => {
                const isVisible = this._visibilityMap.isVisible(line.key);
                const divElements: DivElementsType = this._divElementsMap[line.key];
                if (isVisible) {
                    divElements.itemElement.classList.add('visible');
                } else {
                    divElements.itemElement.classList.remove('visible');
                }
            });
        });
    }

    setNavigationScope(navigationScope: NavigationScopeType): void {
        this._navigationScope = navigationScope;
        if (this._index === null) {
            return;
        }
        const indexRatio = this._index / this._data.maxIndex;
        const ratioWidth = this._navigationScope.maxXRatio - this._navigationScope.minXRatio;
        this.move((indexRatio - this._navigationScope.minXRatio) / ratioWidth);
    }

    setCallbackOnClose(callback: Function): void {
        this._callbackOnClose = callback;
    }

    move(ratio: number): void {
        if (!this._divInfo) {
            return;
        }
        DocumentHelper.update(() => {
            if (ratio < 0.5) {
                this._divInfo.style.left = `${Math.round(ratio * 100) + 1}%`;
                this._divInfo.style.right = 'auto';
            } else {
                this._divInfo.style.right = `${101 - Math.round(ratio * 100)}%`;
                this._divInfo.style.left = 'auto';
            }
        });
    }

    showInfo(index: number): void {
        if (!this._divInfo || index < 0 || index > this._data.maxIndex) {
            return;
        }

        this._index = index;

        DocumentHelper.update(() => {
            const time = this._data.x[index];
            this._divDate.innerText = DateUtils.getDayMonDate(time);

            this._data.lines.forEach((line: ChartLineType) => {
                const divElements: DivElementsType = this._divElementsMap[line.key];
                divElements.valueElement.innerText = line.values[index];
                divElements.titleElement.innerHTML = line.name;
            });

            this._divInfo.classList.add('visible');
        });

    }

    render(container: HTMLElement) {
        this._divInfo = DocumentHelper.createDivElement('InfoBox');
        this._divDate = DocumentHelper.createDivElement('InfoBox-Date', this._divInfo);

        this._data.lines.forEach((chartLine: ChartLineType) => {
            const itemElement: HTMLDivElement = DocumentHelper.createDivElement(['InfoBox-Item', 'visible'], this._divInfo);
            itemElement.style.color = chartLine.color;
            const valueElement: HTMLDivElement = DocumentHelper.createDivElement('InfoBox-Item-Value', itemElement);
            const titleElement: HTMLDivElement = DocumentHelper.createDivElement('InfoBox-Item-Title', itemElement);
            this._divElementsMap[chartLine.key] = { itemElement, valueElement, titleElement };
        });

        container.appendChild(this._divInfo);

        this.addEventListener(this._divInfo, ['click', 'touchstart'], () => {
            this._callbackOnClose();
            this._divInfo.classList.remove('visible');
        });
    }

}
