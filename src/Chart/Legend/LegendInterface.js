// @flow

import type { RenderInterface } from '../Base/RenderInterface';

export type VisibilityMapType = {
    [string]: boolean;
}

export interface LegendInterface extends RenderInterface {

    setCallbackOnChangeVisibility(callback: Function): void;

    getVisibilityMap(): VisibilityMapType;
}
