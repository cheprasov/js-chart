// @flow

import type { RenderInterface } from '../Base/RenderInterface';
import VisibilityMap from './VisibilityMap/VisibilityMap';

export type VisibilityType = {
    [string]: boolean;
}

export interface LegendInterface extends RenderInterface {

    setCallbackOnChangeVisibility(callback: Function): void;

    getVisibilityMap(): VisibilityMap;

}
