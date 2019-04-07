// @flow

import Legend from './Legend/Legend';
import Navigation from './Navigation/Navigation';
import DocumentHelper from '../Utils/DocumentHelper';
import LineViewer from './Viewer/LineViewer';
// import FunctionUtils from '../Utils/FunctionUtils';

import type { ChartInterface } from './ChartInterface';
import type { NavigationInterface, NavigationScopeType } from './Navigation/NavigationInterface';
import type { LegendInterface, VisibilityMapType } from './Legend/LegendInterface';
import type { ViewerInterface } from './Viewer/ViewerInterface';

import './Chart.scss';
import FunctionUtils from '../Utils/FunctionUtils';

export type ChartLineType = {
    key: string,
    name: string,
    color: string,
    values: number[],
    maxValue: number,
    minValue: number,
};

export type ChartDataType = {
    lines: ChartLineType[],
    x: number[],
    length: number,
    maxIndex: number,
    minValue: number,
    maxValue: number,
};

type OptionsType = {
    trimAxisY?: boolean,
    renderQualityRatio?: number,
    title?: string;
};

const DEFAULT_CONSTRUCTOR_PARAMS: OptionsType = {
    trimAxisY: false,
    renderQualityRatio: 0.85,
    title: '',
};

const CHART_CLASS_NAME = 'Chart';
const THEME_NIGHT_CLASS_NAME = 'ThemeNight';

export default class Chart implements ChartInterface {

    _data: ChartDataType;
    _chartLegend: LegendInterface;
    _chartNavigation: NavigationInterface;
    _chartViewer: ViewerInterface;
    _divChart: HTMLDivElement | null;
    _title: string = '';

    constructor(data: ChartDataType, options: OptionsType = {}) {
        const params = { ...DEFAULT_CONSTRUCTOR_PARAMS, ...options };
        this._data = data;
        this._title = params.title;

        this._chartLegend = new Legend(data);
        this._chartLegend.setCallbackOnChangeVisibility(this._onChangeVisibility.bind(this));

        const visibilityMap = this._chartLegend.getVisibilityMap();
        this._chartNavigation = new Navigation({
            data,
            visibilityMap,
            trimAxisY: params.trimAxisY,
            renderQualityRatio: params.renderQualityRatio,
        });
        this._chartNavigation.setCallbackOnChangeNavigationScope(this._onChangeNavigationScope.bind(this));

        const navigationScope = this._chartNavigation.getNavigationScope();
        this._chartViewer = new LineViewer({
            data,
            visibilityMap,
            navigationScope,
            renderQualityRatio: params.renderQualityRatio,
        });

        // this._setNavigationScopeToChartViewerDebounced = FunctionUtils.debounce((navScope: NavigationScopeType) => {
        //     this._chartViewer.setNavigationScope(navScope);
        // }, 50);
    }

    _onChangeVisibility(visibilityMap: VisibilityMapType): void {
        this._chartViewer.setVisibilityMap(visibilityMap);
        this._chartNavigation.setVisibilityMap(visibilityMap);
    }

    _onChangeNavigationScope(navigationScope: NavigationScopeType): void {
        this._chartViewer.setNavigationScope(navigationScope);
        //this._setNavigationScopeToChartViewerDebounced(navigationScope);
    }

    render(container: HTMLElement): void {
        this._divChart = DocumentHelper.createDivElement(CHART_CLASS_NAME, container);
        if (this._title) {
            const divTitle = DocumentHelper.createDivElement(`${CHART_CLASS_NAME}-Title`, this._divChart);
            divTitle.appendChild(document.createTextNode(this._title));
        }
        this._chartViewer.render(this._divChart);
        this._chartNavigation.render(this._divChart);
        this._chartLegend.render(this._divChart);
    }

    switchNightTheme(enable: boolean): void {
        if (!this._divChart) {
            return;
        }
        if (enable) {
            this._divChart.classList.add(THEME_NIGHT_CLASS_NAME);
        } else {
            this._divChart.classList.remove(THEME_NIGHT_CLASS_NAME);
        }
        this._chartViewer.switchNightTheme(enable);
    }

}
