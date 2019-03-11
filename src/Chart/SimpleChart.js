// @flow

import ChartLegend from './Legend/ChartLegend';
import ChartNavigation from './Navigation/ChartNavigation';

import type { LegendInterface } from './Legend/LegendInterface';
import type { ChartInterface } from './ChartInterface';
import type { RenderInterface } from './Component/RenderInterface';
import type { NavigationInterface } from './Navigation/NavigationInterface';

import './SimpleChart.scss';

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

export type ChartObjectType = {
    lines: ChartLineType[],
    minValue: number,
    maxValue: number,
};

export default class SimpleChart implements ChartInterface, RenderInterface {

    data: ChartObjectType;
    chartLegend: ChartLegend;
    chartNavigation: ChartNavigation;

    constructor(data: ChartObjectType, options: OptionsType = {}) {
        this.data = data;
        const params = { ...DEFAULT_CONSTRUCTOR_PARAMS, ...options };

        this.chartLegend = new ChartLegend(data);
        this.chartNavigation = new ChartNavigation(data);
    }

    render(container: HTMLElement): void {
        const divChart = document.createElement('div');
        container.appendChild(divChart);

        divChart.classList.add('SimpleChart');
        this.chartNavigation.render(divChart);
        this.chartLegend.render(divChart);
    }

}
