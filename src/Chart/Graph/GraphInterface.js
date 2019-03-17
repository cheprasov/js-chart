// @flow

import type { VisibilityMapType } from '../Legend/LegendInterface';
import type { NavigationScopeType } from '../Navigation/NavigationInterface';

export interface GraphInterface {

    getGraphElement(): HTMLElement;

    drawLines(): void;

    setNavigationScope(navigationScope: NavigationScopeType): void;

    setVisibilityMap(visibilityMap: VisibilityMapType): void;
}
