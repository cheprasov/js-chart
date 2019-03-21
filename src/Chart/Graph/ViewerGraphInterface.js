// @flow

import type { GraphInterface } from './GraphInterface';

export interface ViewerGraphInterface extends GraphInterface {

    selectIndexByRatio(number): null | number;

    unselectIndex(): void;

}
