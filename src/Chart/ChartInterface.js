// @flow

import type { RenderInterface } from './Base/RenderInterface';
import type { NightModeInterface } from './Base/NightModeInterface';

export interface ChartInterface extends RenderInterface, NightModeInterface {

    render(container: HTMLElement): void;

}
