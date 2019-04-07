// @flow

import VisibilityMap from '../Legend/VisibilityMap/VisibilityMap';

import type { NavigationScopeType } from '../Navigation/NavigationInterface';

export interface GraphInterface {

    getGraphElement(): HTMLElement;

    drawLines(): void;

    setNavigationScope(navigationScope: NavigationScopeType): void;

    setVisibilityMap(visibilityMap: VisibilityMap): void;
}
