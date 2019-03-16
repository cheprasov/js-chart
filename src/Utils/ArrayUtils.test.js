import ArrayUtils from './ArrayUtils';

describe('ArrayUtils', () => {
    const arr1 = [1, 29, 30, 79, 32, 12, 1, 1, 1, 67, 44, 33, 29, 5, 2, 1, 90, 25];
    const arr2 = [6, 18, 55, 66, 33, 24, 2, 0, 3, 99, 21, 55, 36, 7, 8, 4, 33, 12];

    describe('getMinMaxValueBySlice', () => {
        it('should return min and max', () => {
            expect(ArrayUtils.getMinMaxValueBySlice(arr1)).toEqual({ minValue: 1, maxValue: 90 });
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
    });

});
