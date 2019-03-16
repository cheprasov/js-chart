//@flow

import LegendItem from './LegendItem';

import type { LegendInterface, VisibilityMapType } from './LegendInterface';
import type { ChartLineType, ChartDataType } from '../Chart';
import type { LegendItemInterface } from './LegendItemInterface';

import './Legend.scss';
import DocumentHelper from '../../Utils/DocumentHelper';

export default class Legend implements LegendInterface {

    _data: ChartDataType;
    _legendItems: LegendItemInterface[] = [];
    _callbackOnChangeVisibility: Function = () => {};
    _visibilityMap: VisibilityMapType = {};

    constructor(data: ChartDataType) {
        this._data = data;
        this._initData();

        this._onChangeVisibility = this._onChangeVisibility.bind(this);
    }

    _initData() {
        this._data.lines.forEach((line: ChartLineType) => {
            this._visibilityMap[line.key] = true;
        });
    }

    setCallbackOnChangeVisibility(callback: Function): void {
        this._callbackOnChangeVisibility = callback;
    }

    _onChangeVisibility(legendItem: LegendItemInterface): void {
        this._visibilityMap[legendItem.getKey()] = legendItem.isVisible();
        this._callbackOnChangeVisibility(this.getVisibilityMap());
    }

    getVisibilityMap(): VisibilityMapType {
        return Object.freeze({ ...this._visibilityMap });
    }

    render(container: HTMLElement) {
        const divChartLegend: HTMLDivElement = DocumentHelper.createDivElement('ChartLegend');

        this._data.lines.forEach((chartLine: ChartLineType) => {
            const legendItem = new LegendItem(chartLine);
            legendItem.setCallbackOnChangeVisibility(this._onChangeVisibility);
            this._legendItems.push(legendItem);
            legendItem.render(divChartLegend);
        });

        container.appendChild(divChartLegend);
    }

}
