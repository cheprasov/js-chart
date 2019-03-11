import type { ChartLineType, ChartObjectType } from '../Chart/SimpleChart';

const SVG_NS = 'http://www.w3.org/2000/svg';

type AttributesType = { [string]: any };

export default class SVGHelper {

    static createNode(nodeTag: string, attributes: AttributesType = {}): SVGElement {
        const node: SVGElement = document.createElementNS(SVG_NS, nodeTag);
        Object.entries(attributes).forEach(([key, value]) => {
            node.setAttributeNS(null, key, value);
        });
        return node;
    }

    static createPolyline(chartLine: ChartLineType, width: number, height: number, maxValue: number, minValue: number) {
        const scaleY = height / ((maxValue - minValue) || 1);
        const scaleX = width / (chartLine.values.length - 1 || 1);

        const polyline = this.createNode('polyline', {
            fill: 'none',
            stroke: chartLine.color,
            'stroke-width': 2,
            points: chartLine.values.map((value, index) => {
                const x = index * scaleX;
                const y = height - (value - minValue) * scaleY;
                return `${x},${y}`;
            }).join(' '),
        });
        return polyline;
    }

    static createSVGBox(chartData: ChartObjectType, width: number, height: number) {
        const svg = this.createNode('svg', { viewBox: `0 0 ${width} ${height}` });

        chartData.lines.forEach((chartLine: ChartLineType) => {
            svg.appendChild(this.createPolyline(chartLine, width, height, chartData.maxValue, chartData.minValue));
        });

        console.log(svg);
        return svg;
    }

}
