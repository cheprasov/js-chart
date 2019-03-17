//@flow

import DocumentHelper from '../../Utils/DocumentHelper';
import GraphCanvas from '../Graph/GraphCanvas';

import type { ViewInterface } from './ViewInterface';
import type { ChartDataType } from '../Chart';
import type { NavigationScopeType } from '../Navigation/NavigationInterface';
import type { VisibilityMapType } from '../Legend/LegendInterface';
import type { GraphInterface } from '../Graph/GraphInterface';

import './LineView.scss';

const GRAPH_LINE_WIDTH = 2.5;

export default class LineView implements ViewInterface  {

    _data: ChartDataType;
    _visibilityMap: VisibilityMapType;
    _navigationScope: NavigationScopeType;

    _graph: GraphInterface;

    constructor(data: ChartDataType, visibilityMap: VisibilityMapType, navigationScope: NavigationScopeType) {
        this._data = data;
        this._visibilityMap = visibilityMap;
        this._navigationScope = navigationScope;
    }

    setNavigationScope(navigationScope: NavigationScopeType): void {
        this._navigationScope = navigationScope;
        if (this._graph) {
            this._graph.setNavigationScope(this._navigationScope);
        }
    }

    setVisibilityMap(visibilityMap: VisibilityMapType): void {
        this._visibilityMap = visibilityMap;
        if (this._graph) {
            this._graph.setVisibilityMap(this._visibilityMap);
        }
    }

    render(container: HTMLElement): void {
        const divView = DocumentHelper.createDivElement('LineView', container);

        const width = divView.clientWidth;
        const height = divView.clientHeight;

        this._graph = new GraphCanvas({
            data: this._data,
            visibilityMap: this._visibilityMap,
            navigationScope: this._navigationScope,
            width,
            height,
            minValue: this._navigationScope.minValue,
            maxValue: this._navigationScope.maxValue,
            lineWidth: GRAPH_LINE_WIDTH,
        });

        const graphElement = this._graph.getGraphElement();
        graphElement.classList.add('Navigation-Graph');
        divView.appendChild(graphElement);
    }

}
