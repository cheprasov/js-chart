//@flow

import type { ChartLineType } from '../SimpleChart';
import type { LegendItemInterface } from './LegendItemInterface';

import './LegendItem.scss';
import BaseComponent from '../Component/BaseComponent';
import type { RenderInterface } from '../Component/RenderInterface';

type OptionsType = {
    labels: HTMLElement | null,
};

const DEFAULT_CONSTRUCTOR_PARAMS: OptionsType = {
    container: null,
    theme: '',
};

export default class LegendItem extends BaseComponent implements LegendItemInterface, RenderInterface {

    container: HTMLDivElement;
    name: string;
    isChecked: boolean = true;

    constructor(lineData: ChartLineType) {
        super();
        this.name = lineData.name;
        this.color = lineData.color;

        this.onClick = this.onClick.bind(this);
    }

    onClick(event) {
        const target: HTMLElement = event.currentTarget;

        this.isChecked = !this.isChecked;
        if (this.isChecked) {
            this.addClass(target, 'checked');
        } else {
            this.removeClass(target, 'checked');
        }
    }

    render(container: HTMLElement): void {
        const divLegend: HTMLDivElement = document.createElement('div');
        divLegend.classList.add('ChartLegend-Item', 'checked');
        this.addEventListener(divLegend, 'click', this.onClick);

        const divIcon: HTMLDivElement = document.createElement('div');
        divIcon.classList.add('ChartLegend-Item-Icon');
        divIcon.style.backgroundColor = this.color;
        divLegend.appendChild(divIcon);

        const divLabel: HTMLDivElement = document.createElement('div');
        divLabel.classList.add('ChartLegend-Item-Label');
        divLabel.appendChild(document.createTextNode(this.name));
        divLegend.appendChild(divLabel);

        container.appendChild(divLegend);
    }

}
