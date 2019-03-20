
export default class FunctionUtils {

    static debounce(func: Function, timeout:number = 200): Function {
        let time = 0;
        let timerId: number = 0;
        return ((...args) => {
            if (timerId) {
                clearTimeout(timerId);
                timerId = 0;
            } else {
                time = Date.now();
            }

            if (Date.now() - time > timeout) {
                func(...args);
                return;
            }

            timerId = setTimeout(() => {
                    timerId = 0;
                    func(...args);
                }, timeout);
        });
    }

}
