import MathUtils from './MathUtils';

export type MinMaxValueType = {
    minValue: ?number,
    maxValue: ?number,
}

export default class ArrayUtils {

    static getMinMaxValueBySlice(arr: number[], begIndex: number = null, endIndex: number = null): MinMaxValueType {
        const minMaxValues: MinMaxValueType = { minValue: null, maxValue: null };

        const begI = begIndex || 0;
        const endI = endIndex || arr.length - 1;

        for (let i = begI; i <= endI; i += 1) {
            const value = arr[i];

            const minValue = MathUtils.min(minMaxValues.minValue, value);
            if (minValue !== minMaxValues.minValue) {
                minMaxValues.minValue = minValue;
            }

            const maxValue = MathUtils.max(minMaxValues.maxValue, value);
            if (maxValue !== minMaxValues.maxValue) {
                minMaxValues.maxValue = maxValue;
            }
        }

        return minMaxValues;
    }

    static getMinMaxValueBySliceArrays(
        arrs: number[][], begIndex: number = null, endIndex: number = null,
    ): MinMaxValueType {
        return arrs.reduce(
            (result: MinMaxValueType, arr: number[]) => {
                const minMaxValue = ArrayUtils.getMinMaxValueBySlice(arr, begIndex, endIndex);

                const minValue = MathUtils.min(result.minValue, minMaxValue.minValue);
                if (minValue !== result.minValue) {
                    result.minValue = minValue;
                }

                const maxValue = MathUtils.max(result.maxValue, minMaxValue.maxValue);
                if (maxValue !== result.maxValue) {
                    result.maxValue = maxValue;
                }

                return result;
            },
            { minValue: null, maxValue: null },
        );
    }

}
