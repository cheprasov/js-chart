//@flow

import DocumentHelper from '../../Utils/DocumentHelper';
import AxisXGenerator from '../Graph/Axis/AxisXGenerator';
import AxisYGenerator from '../Graph/Axis/AxisYGenerator';

import type { ViewerInterface } from './ViewerInterface';
import type { ChartDataType } from '../Chart';
import type { VisibilityMapType } from '../Legend/LegendInterface';
import type { NavigationScopeType } from '../Navigation/NavigationInterface';
import type { GraphInterface } from '../Graph/GraphInterface';

import './LineViewer.scss';
import LineViewerGraphCanvas, { GRAPH_AXIS_X_TEXT_WIDTH } from '../Graph/LineViewerGraphCanvas';
import ScreenUtils from '../../Utils/ScreenUtils';
import BaseComponent from '../Base/BaseComponent';

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

export default class LineViewer extends BaseComponent implements ViewerInterface {

    _data: ChartDataType;
    _visibilityMap: VisibilityMapType;
    _navigationScope: NavigationScopeType;
    _renderQualityRatio: number;

    _graph: GraphInterface;

    constructor(options: OptionsType) {
        super();
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
        const divView = DocumentHelper.createDivElement('LineViewer', container);

        const width = divView.clientWidth;
        const height = divView.clientHeight;

        this._graph = new LineViewerGraphCanvas({
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

        this._addEvents(graphElement);
    }

    _addEvents(graphElement: HTMLCanvasElement) {
        if (ScreenUtils.isTouchScreen()) {

        } else {
            this.addEventListener(graphElement, 'mousemove', this._onMouseMove.bind(this));
        }
    }

    _onMouseMove(event: MouseEvent) {

    }

}
