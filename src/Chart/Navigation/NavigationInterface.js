// @flow

import type { RenderInterface } from '../Base/RenderInterface';
import type { VisibilityMapType } from '../Legend/LegendInterface';

export interface NavigationInterface extends RenderInterface {

    setVisibilityMap(visibilityMap: VisibilityMapType): void;

}
