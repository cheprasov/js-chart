//@flow

import type { NavigationScopeType } from '../../Navigation/NavigationInterface';

export type AxisYItemType = {
    value: number,
    title: string,
};

export interface AxisYGeneratorInterface {

    setNavigationScope(navigationScope: NavigationScopeType): void;

    getAxisYItems(): null | AxisYItemType[];

    getHash(): null | string;

}
