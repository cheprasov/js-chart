// @flow

import type { GraphInterface } from './GraphInterface';

export type StyleType = {
    fillStyle: string,
    axisYStyle: string,
    axisXStyle: string,
    backgroundColor: string,
}

export interface ViewerGraphInterface extends GraphInterface {

    selectIndexByRatio(number): null | number;

    unselectIndex(): void;

    setStyles(style: StyleType): void;
}
