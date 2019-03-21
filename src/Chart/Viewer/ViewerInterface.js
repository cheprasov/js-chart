// @flow

import type { RenderInterface } from '../Base/RenderInterface';
import type { NavigationScopeType } from '../Navigation/NavigationInterface';
import type { VisibilityMapType } from '../Legend/LegendInterface';
import type { NightModeInterface } from '../Base/NightModeInterface';

export interface ViewerInterface extends RenderInterface, NightModeInterface {

    setNavigationScope(navigationScope: NavigationScopeType): void;

    setVisibilityMap(visibilityMap: VisibilityMapType): void;

}
