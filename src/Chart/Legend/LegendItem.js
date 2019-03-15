//@flow

import type { ChartLineType } from '../Chart';
import type { LegendItemInterface } from './LegendItemInterface';

import './LegendItem.scss';
import BaseComponent from '../Base/BaseComponent';

export default class LegendItem extends BaseComponent implements LegendItemInterface {

    _key: string;
    _name: string;
    _color: string;
    _isChecked: boolean = true;

    _callbackOnChangeVisibility: Function = () => {};

    constructor(lineData: ChartLineType) {
        super();
        this._key = lineData.key;
        this._name = lineData.name;
        this._color = lineData.color;
    }

    setCallbackOnChangeVisibility(callback: Function): void {
        this._callbackOnChangeVisibility = callback;
    }

    getKey(): string {
        return this._key;
    }

    isVisible(): boolean {
        return this._isChecked;
    }

    _onClick(event: MouseEvent | TouchEvent) {
        const target: HTMLElement = event.currentTarget;

        this._isChecked = !this._isChecked;
        if (this._isChecked) {
            target.classList.add('checked');
        } else {
            target.classList.remove('checked');
        }
        if (event.cancelable) {
            event.preventDefault();
        }
        event.stopPropagation();

        this._callbackOnChangeVisibility();
    }

    render(container: HTMLElement): void {
        const divLegend: HTMLDivElement = document.createElement('div');
        divLegend.classList.add('ChartLegend-Item', 'checked');
        // use touchstart for feeling quick interaction
        this.addEventListener(divLegend, ['click', 'touchstart'], this._onClick.bind(this));

        const divIcon: HTMLDivElement = document.createElement('div');
        divIcon.classList.add('ChartLegend-Item-Icon');
        divIcon.style.backgroundColor = this._color;
        divLegend.appendChild(divIcon);

        const divLabel: HTMLDivElement = document.createElement('div');
        divLabel.classList.add('ChartLegend-Item-Label');
        divLabel.appendChild(document.createTextNode(this._name));
        divLegend.appendChild(divLabel);

        container.appendChild(divLegend);
    }

}
