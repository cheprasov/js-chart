// @flow

import LegendItem from './LegendItem';
import DocumentHelper from '../../Utils/DocumentHelper';
import VisibilityMap from './VisibilityMap/VisibilityMap';

import type { LegendInterface, VisibilityType } from './LegendInterface';
import type { ChartLineType, ChartDataType } from '../Chart';

import type { LegendItemInterface } from './LegendItemInterface';
import './Legend.scss';

export default class Legend implements LegendInterface {

    _data: ChartDataType;
    _legendItems: LegendItemInterface[] = [];
    _callbackOnChangeVisibility: Function = () => {};
    _visibility: VisibilityType = {};

    constructor(data: ChartDataType) {
        this._data = data;
        this._initData();

        this._onChangeVisibility = this._onChangeVisibility.bind(this);
    }

    _initData() {
        this._data.lines.forEach((line: ChartLineType) => {
            this._visibility[line.key] = true;
        });
    }

    setCallbackOnChangeVisibility(callback: Function): void {
        this._callbackOnChangeVisibility = callback;
    }

    _onChangeVisibility(legendItem: LegendItemInterface): void {
        this._visibility[legendItem.getKey()] = legendItem.isVisible();
        this._callbackOnChangeVisibility(this.getVisibilityMap());
    }

    getVisibilityMap(): VisibilityMap {
        return new VisibilityMap(this._visibility);
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
