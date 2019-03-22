//@flow

import type { NavigationScopeType } from '../../Navigation/NavigationInterface';

export type AxisYItemType = {
    value: number,
    title: string,
};

export type AxisYItemsMapType = {
    [string]: AxisYItemType;
};

export interface AxisYGeneratorInterface {

    setNavigationScope(navigationScope: NavigationScopeType): void;

    getAxisYItemsMap(): null | AxisYItemsMapType;

}
