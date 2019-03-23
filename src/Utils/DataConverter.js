import type { ChartLineType, ChartDataType } from '../Chart/Chart';

const CHART_DATA_TYPE_X = 'x';
const CHART_DATA_TYPE_LINE = 'line';

type ObjectMapType = { [string]: string };
type ColumnDataType = Array<string|number>;

type ChartDataTypesType = { [string]: CHART_DATA_TYPE_X | CHART_DATA_TYPE_LINE };

export type RawChartDataType = {
    colors: ObjectMapType,
    columns: ColumnDataType[],
    names: ObjectMapType,
    types: ChartDataTypesType,
};

export default class DataConverter {

    static prepareChartData(rawChartData: RawChartDataType): null | ChartDataType {
        if (!rawChartData || !rawChartData.types || !rawChartData.columns) {
            return null;
        }

        const keys = Object.keys(rawChartData.types);
        if (!keys.length) {
            return null;
        }

        const chartLines: ChartLineType[] = [];
        const chartObjects: ChartDataType = {
            lines: chartLines,
            minValue: Infinity,
            maxValue: -Infinity,
        };

        rawChartData.columns.forEach(([key, ...data]) => {
            const type = rawChartData.types[key];

            if (type === CHART_DATA_TYPE_LINE) {
                const lineData: ChartLineType = this._createLine(rawChartData, key, data);
                chartObjects.lines.push(lineData);
                chartObjects.minValue = Math.min(chartObjects.minValue, lineData.minValue);
                chartObjects.maxValue = Math.max(chartObjects.maxValue, lineData.maxValue);
            }
            if (type === CHART_DATA_TYPE_X) {
                if (!chartObjects.x) {
                    chartObjects.x = Object.freeze([...data]);
                    chartObjects.length = data.length;
                    chartObjects.maxIndex = data.length - 1;
                }
            }
        });

        chartObjects.lines = Object.freeze(chartObjects.lines);
        return Object.freeze(chartObjects);
    }

    static _getRandomColor(): string {
        const rgb = [0, 0, 0].map(() => Math.round(Math.random() * 15).toString(16).repeat(2));
        return `#${rgb.join('')}`;
    }

    static _createLine(rawChartData: RawChartDataType, key: string, values: number): ChartLineType {
        const line: ChartLineType = {
            key,
            values: Object.freeze([...values]),
            minValue: Math.min(...values),
            maxValue: Math.max(...values),
            name: rawChartData.names[key] || 'unnamed',
            color: rawChartData.colors[key] || this._getRandomColor(),
        };
        return Object.freeze(line);
    }

}
