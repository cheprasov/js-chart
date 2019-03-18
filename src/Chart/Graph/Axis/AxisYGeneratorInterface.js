//@flow

import type { NavigationScopeType } from '../../Navigation/NavigationInterface';

export type AxisYItemType = {
    index: number,
    title: string,
};

export interface AxisYGeneratorInterface {

    setNavigationScope(navigationScope: NavigationScopeType): void;

    getAxisYItems(): null | AxisYItemType[];

}
