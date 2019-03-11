// @flow

import type { RenderInterface } from './Base/RenderInterface';

export interface ChartInterface extends RenderInterface {

    render(container: HTMLElement): void;

}
