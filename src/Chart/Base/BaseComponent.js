// @flow

import type { BaseComponentInterface } from './BaseComponentInterface';

type EventListenerType = {
    element: HTMLElement,
    type: string,
    callback: Function,
}

export default class BaseComponent implements BaseComponentInterface {

    _registeredEventListeners: EventListenerType[] = [];

    destroy(): void {
        this.removeEventListeners();
    }

    addEventListener(element: HTMLElement, types: string | string[], callback: Function): void {
        const eventTypes = Array.isArray(types) ? types : [types];
        eventTypes.forEach((type: string) => {
            element.addEventListener(type, callback);
            this._registeredEventListeners.push({ element, type, callback });
        });
    }

    removeEventListeners(): void {
        this._registeredEventListeners.forEach((eventListener: EventListenerType) => {
            eventListener.element.removeEventListener(eventListener.type, eventListener.callback);
        });
    }
}
