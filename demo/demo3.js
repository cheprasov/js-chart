// @flow

import { Chart, DataConverter } from '../src';
import jsonData from '../task/chart_data.json';
import type { RawChartDataType } from '../src/Utils/DataConverter';
import type { ChartInterface } from '../src/Chart/ChartInterface';

// Chart code

const divId = 'id-telegram-chart-will-be-here';
const divElement: HTMLDivElement = document.getElementById(divId);

const charts: ChartInterface[] = [];

jsonData.forEach((rawChartData: RawChartDataType, index: number) => {
    const preparedData = DataConverter.prepareChartData(rawChartData);
    if (!preparedData) {
        divElement.appendChild(document.createTextNode(`Wrong chart data with index ${index}`));
        return;
    }

    const chart = new Chart(preparedData, { title: `Chart ${index + 1} (trim by values)`, trimAxisY: true });
    charts.push(chart);

    chart.render(divElement);
});


// Other page code

const isTouchScreen = ('ontouchstart' in document.documentElement);
let isNightMode: boolean = false;

const switcherElement: HTMLSpanElement = document.getElementById('id-theme-switcher');
switcherElement.addEventListener(isTouchScreen ? 'touchstart' : 'click', () => {
    isNightMode = !isNightMode;
    if (isNightMode) {
        document.body.classList.add('night');
    } else {
        document.body.classList.remove('night');
    }
    charts.forEach((chart: ChartInterface) => {
        chart.switchNightTheme(isNightMode);
    });
});
