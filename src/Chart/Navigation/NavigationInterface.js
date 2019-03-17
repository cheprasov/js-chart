// @flow

import type { RenderInterface } from '../Base/RenderInterface';
import type { VisibilityMapType } from '../Legend/LegendInterface';

export type NavigationScopeType = {
    minXRatio: number,
    maxXRatio: number,
    minValue: number,
    maxValue: number,
    minValueSlice: number,
    maxValueSlice: number,
};

export interface NavigationInterface extends RenderInterface {

    setVisibilityMap(visibilityMap: VisibilityMapType): void;

    setCallbackOnChangeNavigationScope(callback: Function): void;

    getNavigationScope(): NavigationScopeType;
}
