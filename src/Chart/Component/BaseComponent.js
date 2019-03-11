import type { BaseComponentInterface } from './BaseComponentInterface';
import DocumentHelper from '../../Utils/DocumentHelper';

type EventListenerType = {
    element: HTMLElement,
    type: string,
    callback: Function,
}

export default class BaseComponent implements BaseComponentInterface {

    _registeredEventListeners: Function[] = [];

    destroy(): void {
        this.removeEventListeners();
    }

    addEventListener(element: HTMLElement, type: string, callback: Function): void {
        element.addEventListener(type, callback);
        this._registeredEventListeners.push({ element, type, callback });
    }

    removeEventListeners(): void {
        this._registeredEventListeners.forEach((eventListener: EventListenerType) => {
            eventListener.element.removeEventListener(eventListener.type, eventListener.callback);
        });
    }

    addClass(element: HTMLElement, classes: string|string[]): Promise {
        return DocumentHelper.addClass(element, classes);
    }

    removeClass(element: HTMLElement, classes: string|string[]): Promise {
        return DocumentHelper.removeClass(element, classes);
    }

}
