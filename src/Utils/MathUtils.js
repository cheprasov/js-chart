
export default class MathUtils {

    static min(a: null | number, b: null | number): null | number {
        if (a === null) {
            return b;
        }
        if (a > b && b !== null) {
            return b;
        }
        return a;
    }

    static max(a: null | number, b: null | number): null | number {
        if (a === null) {
            return b;
        }
        if (a < b && b !== null) {
            return b;
        }
        return a;
    }

    static average(a: number, b: number) {
        return (a + b) / 2;
    }

    static minModBy2(value: number, maxLimit: value) {
        let mod = 1;
        while (value / mod > maxLimit) {
            mod *= 2;
        }
        return mod;
    }

    /* todo: refactor code */
    static largeRound(value: number, len: number = 2): number {
        if (value > -(10 ** len) && value < (10 ** len)) {
            // do not touch small numbers
            return value;
        }
        const power = (Math.round(value)).toString(10).length - len;
        return Math.round(value / (10 ** power)) * (10 ** power);
    }

    static largeFloor(value: number, len: number = 2): number {
        if (value >= -(10 ** len) && value <= (10 ** len)) {
            // do not touch small numbers
            return value;
        }
        const power = (Math.floor(value)).toString(10).length - len;
        return Math.floor(value / (10 ** power)) * (10 ** power);
    }

    static largeCeil(value: number, len: number = 2): number {
        if (value >= -(10 ** len) && value <= (10 ** len)) {
            // do not touch small numbers
            return value;
        }
        const power = (Math.ceil(value)).toString(10).length - len;
        return Math.ceil(value / (10 ** power)) * (10 ** power);
    }

    /* todo: rewrite the function for better result */
    static formatLargeNumber(value: number): string {
        const val = (value).toString();

        // 3 240 000 => 3.24m
        if (val.length > 6 && val.slice(-4) === '0000') {
            return `${value / 1000000} m`;
        }

        // 120 000 => 120k
        if (val.length > 4 && val.slice(-3) === '000') {
            return `${value / 1000} k`;
        }

        return val;
    }

}
