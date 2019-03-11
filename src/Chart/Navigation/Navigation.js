//@flow

import GraphCanvas from '../Graph/CanvasGraph';

import type { NavigationInterface } from './NavigationInterface';
import type { ChartDataType } from '../Chart';
import type { GraphInterface } from '../Graph/GraphInterface';
import type { VisibilityMapType } from '../Legend/LegendInterface';

import './Navigation.scss';

export default class Navigation implements NavigationInterface {

    _data: ChartDataType;
    _graph: GraphInterface;

    constructor(chartData: ChartDataType) {
        this._data = chartData;
    }

    setVisibilityMap(visibilityMap: VisibilityMapType): void {
        if (this._graph) {
            this._graph.setVisibilityMap(visibilityMap);
        }
    }

    render(container: HTMLElement) {
        const divNavigation: HTMLDivElement = document.createElement('div');
        divNavigation.classList.add('Navigation');
        container.appendChild(divNavigation);

        const width = divNavigation.clientWidth;
        const height = divNavigation.clientHeight;

        this._graph = new GraphCanvas(this._data, { width, height });
        const graphElement = this._graph.getGraphElement();
        graphElement.classList.add('Navigation-Graph');
        divNavigation.appendChild(graphElement);
    }

}
