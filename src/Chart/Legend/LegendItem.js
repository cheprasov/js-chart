//@flow

import type { ChartLineType } from '../Chart';
import type { LegendItemInterface } from './LegendItemInterface';

import './LegendItem.scss';
import BaseComponent from '../Base/BaseComponent';
import DocumentHelper from '../../Utils/DocumentHelper';
import ScreenUtils from '../../Utils/ScreenUtils';

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

        if (event.touches && event.touches.length !== 1) {
            return;
        }

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

        this._callbackOnChangeVisibility(this);
    }

    render(container: HTMLElement): void {
        const divLegend: HTMLDivElement = DocumentHelper.createDivElement(['ChartLegend-Item', 'checked']);
        this.addEventListener(
            divLegend,
            // use touchstart for feeling quick interaction
            ScreenUtils.isTouchScreen() ? 'touchstart' : 'click',
            this._onClick.bind(this),
        );

        const divIcon: HTMLDivElement = DocumentHelper.createDivElement('ChartLegend-Item-Icon', divLegend);
        divIcon.style.backgroundColor = this._color;
        DocumentHelper.createDivElement('ChartLegend-Item-Icon-Off', divIcon);

        const divLabel: HTMLDivElement = DocumentHelper.createDivElement('ChartLegend-Item-Label', divLegend);
        divLabel.appendChild(document.createTextNode(this._name));

        container.appendChild(divLegend);
    }

}
