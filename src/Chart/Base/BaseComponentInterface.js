// @flow

export interface BaseComponentInterface {

    destroy(): void;

    addEventListener(element: HTMLElement, type: string, callback: Function): void;

    removeEventListeners(): void;

    addClass(element: HTMLElement, classes: string|string[]): Promise;

    removeClass(element: HTMLElement, classes: string|string[]): Promise;
}
