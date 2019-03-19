// @flow

import Legend from './Legend/Legend';
import Navigation from './Navigation/Navigation';
import DocumentHelper from '../Utils/DocumentHelper';

import type { ChartInterface } from './ChartInterface';
import type { NavigationInterface, NavigationScopeType } from './Navigation/NavigationInterface';
import type { LegendInterface, VisibilityMapType } from './Legend/LegendInterface';
import type { ViewerInterface } from './View/ViewerInterface';

import './Chart.scss';
import LineViewer from './View/LineViewer';

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
    minValue: number,
    maxValue: number,
};

type OptionsType = {
    data: ChartDataType,
    trimAxisY?: boolean,
    renderQualityRatio?: number,
};

const DEFAULT_CONSTRUCTOR_PARAMS: OptionsType = {
    data: null,
    trimAxisY: false,
    renderQualityRatio: 0.75,
};

export default class Chart implements ChartInterface {

    _data: ChartDataType;
    _chartLegend: LegendInterface;
    _chartNavigation: NavigationInterface;
    _chartViewer: ViewerInterface;

    constructor(data: ChartDataType, options: OptionsType = {}) {
        const params = { ...DEFAULT_CONSTRUCTOR_PARAMS, ...options };
        this._data = data;

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
            renderQualityRatio: params.renderQualityRatio
        });
    }

    _onChangeVisibility(visibilityMap: VisibilityMapType): void {
        this._chartNavigation.setVisibilityMap(visibilityMap);
        this._chartViewer.setVisibilityMap(visibilityMap);
    }

    _onChangeNavigationScope(navigationScope: NavigationScopeType): void {
        this._chartViewer.setNavigationScope(navigationScope);
    }

    render(container: HTMLElement): void {
        const divChart = DocumentHelper.createDivElement('Chart', container);

        this._chartViewer.render(divChart);
        this._chartNavigation.render(divChart);
        this._chartLegend.render(divChart);
    }

}
