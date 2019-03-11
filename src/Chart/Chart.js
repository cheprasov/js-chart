// @flow

import Legend from './Legend/Legend';
import Navigation from './Navigation/Navigation';

import type { ChartInterface } from './ChartInterface';
import type { NavigationInterface } from './Navigation/NavigationInterface';
import type { LegendInterface, VisibilityMapType } from './Legend/LegendInterface';

import './Chart.scss';

type OptionsType = {};

const DEFAULT_CONSTRUCTOR_PARAMS: OptionsType = {
    data: null,
};

export type ChartLineType = {
    key: string,
    name: string,
    color: string,
    values: number[],
    maxValue: number,
    minValue: number,
};

export type ChartDataType = {
    lines: ChartLineType[],
    x: number[],
    minValue: number,
    maxValue: number,
};

export default class Chart implements ChartInterface {

    _data: ChartDataType;
    _chartLegend: LegendInterface;
    _chartNavigation: NavigationInterface;

    constructor(data: ChartDataType, options: OptionsType = {}) {
        this._data = data;
        const params = { ...DEFAULT_CONSTRUCTOR_PARAMS, ...options };

        this._chartLegend = new Legend(data);
        this._chartNavigation = new Navigation(data);

        this._onChangeVisibility = this._onChangeVisibility.bind(this);
        this._chartLegend.setCallbackOnChangeVisibility(this._onChangeVisibility);
    }

    _onChangeVisibility(visibilityMap: VisibilityMapType): void {
        this._chartNavigation.setVisibilityMap(visibilityMap);
    }

    render(container: HTMLElement): void {
        const divChart = document.createElement('div');
        container.appendChild(divChart);

        divChart.classList.add('Chart');
        this._chartNavigation.render(divChart);
        this._chartLegend.render(divChart);
    }

}
