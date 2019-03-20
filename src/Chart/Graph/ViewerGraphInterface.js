// @flow

import type { GraphInterface } from './GraphInterface';

export interface ViewerGraphInterface extends GraphInterface {

    selectByRatio(number): null | {};

}
