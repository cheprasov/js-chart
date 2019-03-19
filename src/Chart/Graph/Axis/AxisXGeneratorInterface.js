//@flow

import type { NavigationScopeType } from '../../Navigation/NavigationInterface';

export type AxisXItemType = {
    index: number,
    title: string,
};

export interface AxisXGeneratorInterface {

    setNavigationScope(navigationScope: NavigationScopeType): void;

    getAxisXItems(): null | AxisXItemType[];

    getMod(): number;

    getActiveMods(): number;
}
