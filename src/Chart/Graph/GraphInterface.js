// @flow

import type { VisibilityMapType } from '../Legend/LegendInterface';

export interface GraphInterface {

    getGraphElement(): HTMLElement;

    drawLines(): void;

    setVisibilityMap(visibilityMap: VisibilityMapType): void;
}
