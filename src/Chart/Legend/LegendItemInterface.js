// @flow

import type { RenderInterface } from '../Base/RenderInterface';

export interface LegendItemInterface extends RenderInterface {

    setCallbackOnChangeVisibility(callback: Function): void;

    getKey(): string;

    isVisible(): boolean;

}
