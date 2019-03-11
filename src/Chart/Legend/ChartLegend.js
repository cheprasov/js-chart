//@flow

import type { LegendInterface } from './LegendInterface';
import type { ChartLineType, ChartObjectType } from '../SimpleChart';

import './ChartLegend.scss';
import LegendItem from './LegendItem';
import type { RenderInterface } from '../Component/RenderInterface';

type OptionsType = {
    labels: HTMLElement | null,
};


const DEFAULT_CONSTRUCTOR_PARAMS: OptionsType = {
    container: null,
    theme: '',
};

export default class ChartLegend implements LegendInterface, RenderInterface {

    container: HTMLDivElement;
    data: ChartObjectType;
    legends: LegendInterface[] = [];

    constructor(data: ChartObjectType) {
        this.data = data;
    }

    render(container: HTMLElement) {
        const divChartLegend: HTMLDivElement = document.createElement('div');
        divChartLegend.classList.add('ChartLegend');

        this.data.lines.forEach((chartLine: ChartLineType) => {
            const legendItem = new LegendItem(chartLine);
            this.legends.push(legendItem);
            legendItem.render(divChartLegend);
        });

        container.appendChild(divChartLegend);
    }

}
