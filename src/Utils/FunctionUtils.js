
export default class FunctionUtils {

    static debounce(func: Function, timeout:number = 200): Function {
        let nextTime = 0;
        let time = 0;
        let timerId: number = 0;
        return ((...args) => {
            const timeNow = Date.now();

            if (timerId) {
                clearTimeout(timerId);
                timerId = 0;
            } else {
                time = timeNow;
            }

            if (timeNow - time > timeout || nextTime < timeNow) {
                nextTime = timeNow + timeout;
                func(...args);
                return;
            }

            timerId = setTimeout(
                () => {
                    timerId = 0;
                    nextTime = timeNow + timeout;
                    func(...args);
                },
                timeout,
            );
        });
    }

}
