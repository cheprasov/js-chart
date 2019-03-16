
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

}
