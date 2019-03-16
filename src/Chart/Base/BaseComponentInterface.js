// @flow

export interface BaseComponentInterface {

    destroy(): void;

    addEventListener(element: HTMLElement, type: string, callback: Function): void;

    removeEventListeners(): void;
}
