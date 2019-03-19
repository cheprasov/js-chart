//@flow

import DocumentHelper from '../../Utils/DocumentHelper';
import LineGraphCanvas, { GRAPH_AXIS_X_TEXT_WIDTH } from '../Graph/LineGraphCanvas';
import AxisXGenerator from '../Graph/Axis/AxisXGenerator';
import AxisYGenerator from '../Graph/Axis/AxisYGenerator';

import type { ViewInterface } from './ViewInterface';
import type { ChartDataType } from '../Chart';
import type { VisibilityMapType } from '../Legend/LegendInterface';
import type { NavigationScopeType } from '../Navigation/NavigationInterface';
import type { GraphInterface } from '../Graph/GraphInterface';

import './LineView.scss';

const GRAPH_LINE_WIDTH = 2.5;
const GRAPH_AXIS_Y_COUNT = 6;

type OptionsType = {
    data: ChartDataType,
    visibilityMap: VisibilityMapType,
    navigationScope: NavigationScopeType,
    renderQualityRatio?: number,
};

const DEFAULT_CONSTRUCTOR_PARAMS: OptionsType = {
    data: null,
    visibilityMap: null,
    navigationScope: null,
    renderQualityRatio: 1,
};

export default class LineView implements ViewInterface {

    _data: ChartDataType;
    _visibilityMap: VisibilityMapType;
    _navigationScope: NavigationScopeType;
    _renderQualityRatio: number;

    _graph: GraphInterface;

    constructor(options: OptionsType) {
        const params = { ...DEFAULT_CONSTRUCTOR_PARAMS, ...options };

        this._data = params.data;
        this._visibilityMap = params.visibilityMap;
        this._navigationScope = params.navigationScope;
        this._renderQualityRatio = params.renderQualityRatio;
    }

    setNavigationScope(navigationScope: NavigationScopeType): void {
        this._navigationScope = navigationScope;
        if (this._graph) {
            this._graph.setNavigationScope(navigationScope);
        }
    }

    setVisibilityMap(visibilityMap: VisibilityMapType): void {
        this._visibilityMap = visibilityMap;
        if (this._graph) {
            this._graph.setVisibilityMap(visibilityMap);
        }
    }

    render(container: HTMLElement): void {
        const divView = DocumentHelper.createDivElement('LineView', container);

        const width = divView.clientWidth;
        const height = divView.clientHeight;

        this._graph = new LineGraphCanvas({
            data: this._data,
            visibilityMap: this._visibilityMap,
            navigationScope: this._navigationScope,
            width,
            height,
            minValue: this._navigationScope.minValue,
            maxValue: this._navigationScope.maxValue,
            lineWidth: GRAPH_LINE_WIDTH,
            axisYGenerator: new AxisYGenerator(GRAPH_AXIS_Y_COUNT, this._navigationScope),
            axisXGenerator: new AxisXGenerator(this._data, this._navigationScope, width, GRAPH_AXIS_X_TEXT_WIDTH),
            renderQualityRatio: this._renderQualityRatio,
        });

        const graphElement = this._graph.getGraphElement();
        graphElement.classList.add('Navigation-Graph');
        divView.appendChild(graphElement);
    }

}
