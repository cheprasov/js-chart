// @flow

import type { VisibilityMapType } from '../Legend/LegendInterface';

export type VerticalScopeType = {
    minValue: number,
    maxValue: number,
}

export interface GraphInterface {

    getGraphElement(): HTMLElement;

    drawLines(): void;

    setVerticalScope(verticalScope: VerticalScopeType): void;

    setVisibilityMap(visibilityMap: VisibilityMapType, verticalScope: VerticalScopeType): void;
}
