// @flow

import VisibilityMap from '../../Legend/VisibilityMap/VisibilityMap';

import type { RenderInterface } from '../../Base/RenderInterface';
import type { NavigationScopeType } from '../../Navigation/NavigationInterface';

export interface InfoBoxInterface extends RenderInterface {

    setVisibilityMap(visibilityMap: VisibilityMap): void;

    setNavigationScope(navigationScope: NavigationScopeType): void;

    setCallbackOnClose(callback: Function): void;

    showInfo(index: number): void;

    move(ratio: number): void;
}
