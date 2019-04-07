// @flow

import DocumentHelper from '../../Utils/DocumentHelper';
import AxisXGenerator from '../Graph/Axis/AxisXGenerator';
import AxisYGenerator from '../Graph/Axis/AxisYGenerator';
import LineViewerGraphCanvas, { GRAPH_AXIS_X_TEXT_WIDTH } from '../Graph/LineViewerGraphCanvas';
import ScreenUtils from '../../Utils/ScreenUtils';
import BaseComponent from '../Base/BaseComponent';
import EventHelper from '../../Utils/EventHelper';
import InfoBox from './Infobox/InfoBox';
import Constants from '../../constants';
import VisibilityMap from '../Legend/VisibilityMap/VisibilityMap';

import type { ViewerInterface } from './ViewerInterface';
import type { ChartDataType } from '../Chart';
import type { NavigationScopeType } from '../Navigation/NavigationInterface';
import type { ViewerGraphInterface } from '../Graph/ViewerGraphInterface';
import type { InfoBoxInterface } from './Infobox/InfoBoxInterface';

import './LineViewer.scss';

const GRAPH_LINE_WIDTH = 2.5;
const GRAPH_AXIS_Y_COUNT = 6;

type OptionsType = {
    data: ChartDataType,
    visibilityMap: VisibilityMap,
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
    _visibilityMap: VisibilityMap;
    _navigationScope: NavigationScopeType;
    _renderQualityRatio: number;

    _graph: ViewerGraphInterface;
    _infoBox: InfoBoxInterface;

    _isMouseDown: boolean = false;

    constructor(options: OptionsType) {
        super();
        const params = { ...DEFAULT_CONSTRUCTOR_PARAMS, ...options };

        this._data = params.data;
        this._visibilityMap = params.visibilityMap;
        this._navigationScope = params.navigationScope;
        this._renderQualityRatio = params.renderQualityRatio;

        this._infoBox = new InfoBox({ data: params.data, visibilityMap: params.visibilityMap });
    }

    setNavigationScope(navigationScope: NavigationScopeType): void {
        this._navigationScope = navigationScope;
        this._infoBox.setNavigationScope(navigationScope);
        if (this._graph) {
            this._graph.setNavigationScope(navigationScope);
        }
    }

    setVisibilityMap(visibilityMap: VisibilityMap): void {
        this._visibilityMap = visibilityMap;
        this._infoBox.setVisibilityMap(visibilityMap);
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
            style: Constants.Theme.Day.Graph,
        });

        const graphElement = this._graph.getGraphElement();
        graphElement.classList.add('LineViewer-Graph');
        divView.appendChild(graphElement);

        this._infoBox.render(divView);

        this._addEvents(graphElement);
    }

    _selectGraphElement(ratio: number) {
        const index = this._graph.selectIndexByRatio(ratio);
        this._infoBox.showInfo(index);
        this._infoBox.move(ratio);
    }

    _addEvents(graphElement: HTMLElement) {
        const isTouchScreen = ScreenUtils.isTouchScreen();
        const eventTypes = isTouchScreen ? ['touchmove', 'touchstart'] : ['mousemove'];
        //this._selectGraphElement = FunctionUtils.debounce(this._selectGraphElement.bind(this), 0);

        this._onGraphMove = this._onGraphMove.bind(this, graphElement, isTouchScreen);
        this.addEventListener(graphElement, eventTypes, this._onGraphMove);

        if (!isTouchScreen) {
            this.addEventListener(graphElement, 'mousedown', (event: MouseEvent) => {
                this._isMouseDown = true;
                this._onGraphMove(event);
            });
            this.addEventListener(document, 'mouseup', () => {
                this._isMouseDown = false;
            });
        }

        this._infoBox.setCallbackOnClose(this._graph.unselectIndex.bind(this._graph));
    }

    _onGraphMove(graphElement: HTMLElement, isTouchScreen: boolean, event: MouseEvent | TouchEvent) {
        if (!isTouchScreen && !this._isMouseDown) {
            return;
        }
        const clientX = EventHelper.getClientX(event);
        if (clientX === null) {
            return;
        }
        const bounds: DOMRect = graphElement.getBoundingClientRect();
        const x = clientX - bounds.left;
        this._selectGraphElement(x / bounds.width);
    }

    switchNightTheme(enable: boolean): void {
        this._graph.setStyles(enable ? Constants.Theme.Night.Graph : Constants.Theme.Day.Graph);
    }
}
