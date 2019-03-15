//@flow

import LegendItem from './LegendItem';

import type { LegendInterface, VisibilityMapType } from './LegendInterface';
import type { ChartLineType, ChartDataType } from '../Chart';
import type { LegendItemInterface } from './LegendItemInterface';

import './Legend.scss';

export default class Legend implements LegendInterface {

    _data: ChartDataType;
    _legendItems: LegendItemInterface[] = [];
    _callbackOnChangeVisibility: Function = () => {};

    constructor(data: ChartDataType) {
        this._data = data;

        this._onChangeVisibility = this._onChangeVisibility.bind(this);
    }

    setCallbackOnChangeVisibility(callback: Function): void {
        this._callbackOnChangeVisibility = callback;
    }

    _onChangeVisibility(): void {
        this._callbackOnChangeVisibility(this.getVisibilityMap());
    }

    getVisibilityMap(): VisibilityMapType {
        const visibilityMap: VisibilityMapType = this._legendItems.reduce(
            (map: {}, legendItem: LegendItemInterface) => {
                map[legendItem.getKey()] = legendItem.isVisible();
                return map;
            },
            {},
        );
        return Object.freeze(visibilityMap);
    }

    render(container: HTMLElement) {
        const divChartLegend: HTMLDivElement = document.createElement('div');
        divChartLegend.classList.add('ChartLegend');

        this._data.lines.forEach((chartLine: ChartLineType) => {
            const legendItem = new LegendItem(chartLine);
            legendItem.setCallbackOnChangeVisibility(this._onChangeVisibility);
            this._legendItems.push(legendItem);
            legendItem.render(divChartLegend);
        });

        container.appendChild(divChartLegend);
    }

}
