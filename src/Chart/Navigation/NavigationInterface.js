// @flow

import VisibilityMap from '../Legend/VisibilityMap/VisibilityMap';

import type { RenderInterface } from '../Base/RenderInterface';

export type NavigationScopeType = {
    minXRatio: number,
    maxXRatio: number,
    minValue: number,
    maxValue: number,
    minValueSlice: number,
    maxValueSlice: number,
};

export interface NavigationInterface extends RenderInterface {

    setVisibilityMap(visibilityMap: VisibilityMap): void;

    setCallbackOnChangeNavigationScope(callback: Function): void;

    getNavigationScope(): NavigationScopeType;
}
