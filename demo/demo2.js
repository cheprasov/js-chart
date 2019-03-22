// @flow

import { Chart, DataConverter } from '../src';
import jsonData from '../task/chart_data.json';
import type { RawChartDataType } from '../src/Utils/DataConverter';
import type { ChartInterface } from '../src/Chart/ChartInterface';

// Chart code

const divId = 'id-telegram-chart-will-be-here';
const divContainer: HTMLDivElement = document.getElementById(divId);
const charts: ChartInterface[] = [];
let switcherElement: HTMLDivElement;

jsonData.forEach((rawChartData: RawChartDataType, index: number) => {
    const preparedData = DataConverter.prepareChartData(rawChartData);
    if (!preparedData) {
        divContainer.appendChild(document.createTextNode(`Wrong chart data with index ${index}`));
        return;
    }

    const qualityRatio: number = 1 - (jsonData.length ? (index / (jsonData.length - 1)) : 0);
    const chart = new Chart(
        preparedData,
        {
            title: `Chart ${index + 1}, Quality ${Math.round(qualityRatio * 100)}% `,
            renderQualityRatio: qualityRatio,
        },
    );
    charts.push(chart);
    chart.render(divContainer);

    if (!index) {
        switcherElement = document.createElement('a');
        switcherElement.classList.add('ThemeSwitcher');
        switcherElement.setAttribute('href', '#');
        divContainer.appendChild(switcherElement);
    }
});

// Code for switching theme mode for all charts together

if (switcherElement) {
    const isTouchScreen = ('ontouchstart' in document.documentElement);

    let isNightMode: boolean = false;
    switcherElement.addEventListener(isTouchScreen ? 'touchstart' : 'click', (event: TouchEvent | MouseEvent) => {
        isNightMode = !isNightMode;
        if (isNightMode) {
            document.body.classList.add('night');
        } else {
            document.body.classList.remove('night');
        }
        charts.forEach((chart: ChartInterface) => {
            chart.switchNightTheme(isNightMode);
        });

        if (event.cancelable) {
            event.preventDefault();
        }
        event.stopPropagation();
    });
}
