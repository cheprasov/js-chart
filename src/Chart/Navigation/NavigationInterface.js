// @flow

import type { RenderInterface } from '../Base/RenderInterface';
import type { VisibilityMapType } from '../Legend/LegendInterface';

export type NavigationScopeType = {
    minValue: number,
    maxValue: number,
    minXIndex: number,
    maxXIndex: number,
    minValueSlice: number,
    maxValueSlice: number,
};

export interface NavigationInterface extends RenderInterface {

    setVisibilityMap(visibilityMap: VisibilityMapType): void;

    setCallbackOnChangeNavigationScope(callback: Function): void;

    getNavigationScope(): NavigationScopeType;
}
