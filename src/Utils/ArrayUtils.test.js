import ArrayUtils from './ArrayUtils';

describe('ArrayUtils', () => {
    //            0   1   2   3   4   5  6  7  8   9  10  11  12 13 14 15  16  17 18
    const arr1 = [1, 29, 30, 79, 32, 12, 1, 1, 1, 67, 44, 33, 29, 5, 2, 1, 90, 25, 7];
    const arr2 = [6, 18, 55, 66, 33, 24, 2, 0, 3, 99, 21, 55, 36, 7, 8, 4, 33, 12, 7];

    describe('getMinMaxValueBySlice', () => {
        it('should return min and max', () => {
            expect(ArrayUtils.getMinMaxValueBySlice(arr1)).toEqual({ minValue: 1, maxValue: 90 });
        });

        it('should return min and max for slice', () => {
            expect(ArrayUtils.getMinMaxValueBySlice(arr1, 1, 5)).toEqual({ minValue: 12, maxValue: 79 });
            expect(ArrayUtils.getMinMaxValueBySlice(arr1, 6, 8)).toEqual({ minValue: 1, maxValue: 1 });
            expect(ArrayUtils.getMinMaxValueBySlice(arr1, 12, 16)).toEqual({ minValue: 1, maxValue: 90 });
            expect(ArrayUtils.getMinMaxValueBySlice(arr1, 9, 12)).toEqual({ minValue: 29, maxValue: 67 });
            expect(ArrayUtils.getMinMaxValueBySlice(arr1, 5, 5)).toEqual({ minValue: 12, maxValue: 12 });
        });
    });

    describe('getMinMaxValueBySliceArrays', () => {
        it('should return min and max', () => {
            expect(ArrayUtils.getMinMaxValueBySliceArrays([arr1])).toEqual({ minValue: 1, maxValue: 90 });
            expect(ArrayUtils.getMinMaxValueBySliceArrays([arr1, arr1])).toEqual({ minValue: 1, maxValue: 90 });

            expect(ArrayUtils.getMinMaxValueBySliceArrays([arr2])).toEqual({ minValue: 0, maxValue: 99 });
            expect(ArrayUtils.getMinMaxValueBySliceArrays([arr2, arr2])).toEqual({ minValue: 0, maxValue: 99 });

            expect(ArrayUtils.getMinMaxValueBySliceArrays([arr1, arr2])).toEqual({ minValue: 0, maxValue: 99 });
        });

        it('should return min and max for slice', () => {
            expect(ArrayUtils.getMinMaxValueBySliceArrays([arr1, arr2], 1, 5)).toEqual({ minValue: 12, maxValue: 79 });
            expect(ArrayUtils.getMinMaxValueBySliceArrays([arr1, arr2], 9, 11)).toEqual({ minValue: 21, maxValue: 99 });
            expect(ArrayUtils.getMinMaxValueBySliceArrays([arr1, arr2], 6, 8)).toEqual({ minValue: 0, maxValue: 3 });
            expect(ArrayUtils.getMinMaxValueBySliceArrays([arr1, arr2], 5, 5)).toEqual({ minValue: 12, maxValue: 24 });
            expect(ArrayUtils.getMinMaxValueBySliceArrays([arr1, arr2], 18, 18)).toEqual({ minValue: 7, maxValue: 7 });
        });
    });

});
