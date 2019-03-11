import type { ChartLineType, ChartObjectType } from '../Chart/SimpleChart';

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

    static prepareChartData(rawChartData: RawChartDataType): null | ChartObjectType {
        if (!rawChartData || !rawChartData.types || !rawChartData.columns) {
            return null;
        }

        const keys = Object.keys(rawChartData.types);
        if (!keys.length) {
            return null;
        }

        const chartLines: ChartLineType[] = [];
        const chartObjects: ChartObjectType = {
            lines: chartLines,
            minValue: Infinity,
            maxValue: -Infinity,
        };

        rawChartData.columns.forEach(([key, ...data]) => {
            const type = rawChartData.types[key];

            if (type === CHART_DATA_TYPE_LINE) {
                const lineData: ChartLineType = this.createLineObject(rawChartData, key, data);
                chartObjects.lines.push(lineData);
                chartObjects.minValue = Math.min(chartObjects.minValue, lineData.minValue);
                chartObjects.maxValue = Math.max(chartObjects.maxValue, lineData.maxValue);
            }
            if (type === CHART_DATA_TYPE_X) {
                if (!chartObjects.x) {
                    chartObjects.x = data;
                }
            }
        });


        return Object.freeze(chartObjects);
    }

    static getRandomColor(): string {
        const rgb = [0, 0, 0].map(() => Math.round(Math.random() * 15).toString(16).repeat(2));
        return `#${rgb.join('')}`;
    }

    static createLineObject(rawChartData: RawChartDataType, key: string, values: number): ChartLineType {
        const line: ChartLineType = {
            key,
            values,
            minValue: Math.min(...values),
            maxValue: Math.max(...values),
            name: rawChartData.names[key] || 'unnamed',
            color: rawChartData.colors[key] || this.getRandomColor(),
        };
        return Object.freeze(line);
    }

}
