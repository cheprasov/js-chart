// @flow

import type { RenderInterface } from '../Base/RenderInterface';
import type { VisibilityMapType } from '../Legend/LegendInterface';

export type NavigationScopeType = {
    minValue: number,
    maxValue: number,
    minX: number,
    maxX: number,
};

export interface NavigationInterface extends RenderInterface {

    setVisibilityMap(visibilityMap: VisibilityMapType): void;

    setCallbackOnChangeNavigationScope(callback: Function): void;

    getNavigationScope(): NavigationScopeType;
}
