
export default class DocumentHelper {

    static update(callback): Promise {
        return new Promise((resolve) => {
            window.requestAnimationFrame(() => {
                resolve(callback());
            });
        });
    }

    static addClass(element: HTMLElement, classes: string|string[]): Promise {
        //return this.update(() => {
            if (Array.isArray(classes)) {
                element.classList.add(...classes);
            } else {
                element.classList.add(classes);
            }
        //});
    }

    static removeClass(element: HTMLElement, classes: string|string[]): Promise {
        return this.update(() => {
            if (Array.isArray(classes)) {
                element.classList.remove(...classes);
            } else {
                element.classList.remove(classes);
            }
        });
    }
}
