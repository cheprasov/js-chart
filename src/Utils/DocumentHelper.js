// @flow

export default class DocumentHelper {

    static update(callback): Promise {
        return new Promise((resolve) => {
            window.requestAnimationFrame(() => {
                resolve(callback());
            });
        });
    }

    static createDivElement(classes: ?string|string[] = null, parent: ?HTMLElement = null): HTMLDivElement {
        const div = document.createElement('div');
        if (classes) {
            if (Array.isArray(classes)) {
                div.classList.add(...classes.filter(className => !!className));
            } else {
                div.classList.add(classes);
            }
        }
        if (parent) {
            parent.appendChild(div);
        }
        return div;
    }

}
