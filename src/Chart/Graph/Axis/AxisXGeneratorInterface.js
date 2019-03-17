//@flow

import type { NavigationScopeType } from '../../Navigation/NavigationInterface';

export type AxisXLineType = {
    value: number,
    title: string,
};

export interface AxisXGeneratorInterface {

    setNavigationScope(navigationScope: NavigationScopeType): void;

    getAxisXLines(): null | AxisXLineType[];

    getHash(): null | string;

}
