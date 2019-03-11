//@flow

import type { NavigationInterface } from './NavigationInterface';
import type { RenderInterface } from '../Component/RenderInterface';
import type { ChartObjectType } from '../SimpleChart';

import './ChartNavigation.scss';
import SVGHelper from '../../Utils/SVGHelper';

export default class ChartNavigation implements NavigationInterface, RenderInterface {

    constructor(data: ChartObjectType) {
        this.data = data;
    }

    render(container: HTMLElement) {
        const divNavigation: HTMLDivElement = document.createElement('div');
        divNavigation.classList.add('ChartNavigation');
        container.appendChild(divNavigation);

        const width = divNavigation.clientWidth;
        const height = divNavigation.clientHeight;

        const svg = SVGHelper.createSVGBox(this.data, width, height);
        svg.classList.add('ChartNavigation-SVG');
        divNavigation.appendChild(svg);
    }

}
