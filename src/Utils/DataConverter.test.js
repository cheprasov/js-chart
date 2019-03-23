import DataConverter from './DataConverter';
import type { ChartLineType } from '../Chart/Chart';

describe('DataConverter', () => {
    const regExp = /^#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3$/;

    describe('_getRandomColor', () => {
        it ('should generate color', () => {
            expect(regExp.test(DataConverter._getRandomColor())).toBeTruthy();
            expect(regExp.test(DataConverter._getRandomColor())).toBeTruthy();
            expect(regExp.test(DataConverter._getRandomColor())).toBeTruthy();
            expect(regExp.test(DataConverter._getRandomColor())).toBeTruthy();
            expect(regExp.test(DataConverter._getRandomColor())).toBeTruthy();
        });

        it ('should generate random color', () => {
            // should be very low probability (16^6) of getting the same color, do not account it
            const color1 = DataConverter._getRandomColor();
            const color2 = DataConverter._getRandomColor();
            const color3 = DataConverter._getRandomColor();
            expect(color1).not.toEqual(color2);
            expect(color1).not.toEqual(color3);
            expect(color2).not.toEqual(color3);
        });
    });

    // static _createLine(rawChartData: RawChartDataType, key: string, values: number): ChartLineType {
    //     const line: ChartLineType = {
    //         key,
    //         values,
    //         minValue: Math.min(...values),
    //         maxValue: Math.max(...values),
    //         name: rawChartData.names[key] || 'unnamed',
    //         color: rawChartData.colors[key] || this._getRandomColor(),
    //     };
    //     return Object.freeze(line);
    // }

    describe('_createLine', () => {
        const rawChartData = {
            names: {
                foo42: "fooName",
            },
            colors: {
                foo42: "#AABBCC",
            },
        };

        it ('should create a new line object by data', () => {
            expect(DataConverter._createLine(rawChartData, 'foo42', [12, 14, 0, 42])).toEqual({
                key: 'foo42',
                values: [12, 14, 0, 42],
                minValue: 0,
                maxValue: 42,
                name: 'fooName',
                color: '#AABBCC',
            });
        });

        it ('should create random color for line if color is not provided', () => {
            const line = DataConverter._createLine(rawChartData, 'bar', [12, 14, 0, 42]);
            expect(regExp.test(line.color)).toBeTruthy();
        });

        it ('should mark as "unnamed" for line if name is not provided', () => {
            const line = DataConverter._createLine(rawChartData, 'bar', [12, 14, 0, 42]);
            expect(line.name).toEqual('unnamed');
        });

        it ('should return line DTO object protected from changes', () => {
            const line = DataConverter._createLine(rawChartData, 'foo42', [12, 14, 0, 42]);
            expect(() => {
                line.key = 'some';
            }).toThrowError();
            expect(() => {
                line.color = '#CCDDFF';
            }).toThrowError();
            expect(() => {
                line.values[0] = 17;
            }).toThrowError();
            expect(() => {
                line.values = [1, 2, 3];
            }).toThrowError();
        });
    });

    describe('prepareChartData', () => {
        const rawChartData = {
            columns: [
                ['x', 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                ['y0', 12, 14, 55, 8, 97, 5, 5, 88, 4, 66, 55],
                ['y1', 11, 2, 4, 4, 5, 43, 89, 34, 55, 21, 53],
            ],
            types: {
                y0: 'line',
                y1: 'line',
                x: 'x',
            },
            names: {
                y0: '#0',
                y1: '#1',
            },
            colors: {
                y0: '#3DC23F',
                y1: '#F34C44',
            },
        };

        it ('should return prepared chart data', () => {
            const preparedData = DataConverter.prepareChartData(rawChartData);
            // todo: use another way to check order of lines, not defined order for object properties
            expect(preparedData).toEqual({
                lines: [
                    {
                        key: 'y0',
                        name: '#0',
                        color: '#3DC23F',
                        values: [12, 14, 55, 8, 97, 5, 5, 88, 4, 66, 55],
                        maxValue: 97,
                        minValue: 4,
                    },
                    {
                        key: 'y1',
                        name: '#1',
                        color: '#F34C44',
                        values: [11, 2, 4, 4, 5, 43, 89, 34, 55, 21, 53],
                        maxValue: 89,
                        minValue: 2,
                    },
                ],
                x: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                length: 11,
                maxIndex: 10,
                minValue: 2,
                maxValue: 97,
            });
        });

        it ('should prepared data object protected from changes', () => {
            const preparedData = DataConverter.prepareChartData(rawChartData);
            expect(() => {
                preparedData.x = [1, 2, 3];
            }).toThrowError();
            expect(() => {
                preparedData.x[0] = 42;
            }).toThrowError();
            expect(() => {
                preparedData.maxIndex = 42;
            }).toThrowError();
            expect(() => {
                preparedData.minValue = 42;
            }).toThrowError();
            expect(() => {
                preparedData.minValue = 42;
            }).toThrowError();
            expect(() => {
                preparedData.lines = [1, 2, 3];
            }).toThrowError();
            expect(() => {
                preparedData.lines[0] = 1;
            }).toThrowError();
        });
    });

});
