// @flow

import Legend from './Legend/Legend';
import Navigation from './Navigation/Navigation';
import DocumentHelper from '../Utils/DocumentHelper';

import type { ChartInterface } from './ChartInterface';
import type { NavigationInterface, NavigationScopeType } from './Navigation/NavigationInterface';
import type { LegendInterface, VisibilityMapType } from './Legend/LegendInterface';
import type { ViewInterface } from './View/ViewInterface';

import './Chart.scss';
import LineView from './View/LineView';

type OptionsType = {};

const DEFAULT_CONSTRUCTOR_PARAMS: OptionsType = {
    data: null,
};

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
    minValue: number,
    maxValue: number,
};

export default class Chart implements ChartInterface {

    _data: ChartDataType;
    _chartLegend: LegendInterface;
    _chartNavigation: NavigationInterface;
    _chartView: ViewInterface;

    constructor(data: ChartDataType, options: OptionsType = {}) {
        this._data = data;
        const params = { ...DEFAULT_CONSTRUCTOR_PARAMS, ...options };

        this._chartLegend = new Legend(data);
        this._chartLegend.setCallbackOnChangeVisibility(this._onChangeVisibility.bind(this));

        const visibilityMap = this._chartLegend.getVisibilityMap();
        console.log(visibilityMap);
        this._chartNavigation = new Navigation(data, visibilityMap);
        this._chartNavigation.setCallbackOnChangeNavigationScope(this._onChangeNavigationScope.bind(this));

        const navigationScope = this._chartNavigation.getNavigationScope();
        this._chartView = new LineView(data, visibilityMap, navigationScope);
    }

    _onChangeVisibility(visibilityMap: VisibilityMapType): void {
        this._chartNavigation.setVisibilityMap(visibilityMap);
        this._chartView.setVisibilityMap(visibilityMap);
    }

    _onChangeNavigationScope(navigationScope: NavigationScopeType): void {
        this._chartView.setNavigationScope(navigationScope);
    }

    render(container: HTMLElement): void {
        const divChart = DocumentHelper.createDivElement('Chart', container);

        this._chartView.render(divChart);
        this._chartNavigation.render(divChart);
        this._chartLegend.render(divChart);
    }

}
