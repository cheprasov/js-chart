# JS Chart

## About the project
The project was created as a solution for Telegram March Coding Competition, but I decided to convert it to open source project and continue developing.

### Demo

Demo 1 [https://demo-chart.pages.dev/demo1](https://demo-chart.pages.dev/demo1)

Demo 2 [https://demo-chart.pages.dev/demo2](https://demo-chart.pages.dev/demo2)

### Tech stack
- JavaScript, ES6, Flow
- Webpack, Nodejs
- Jest

### Tests
I manually tested work of the code on the latest version of the next browsers:
  - Chrome (Mac)
  - Firefox (Mac)
  - Safari (Mac)
  - Mobile Chrome (Android 9, IPhone 7)
  - Mobile Safari (IPhone 7)

### Support old browsers
I did not check compatibility with old browsers, but for support them it is possible to add some polyfill library.

### Hot to use
The json with data should be prepared for chart, it helps to make the chart library independent from json format.

Example:
```JavaScript
import { Chart, DataConverter } from '@cheprasov/telegram-chart';

import rawChartData from './chart_data.json';

// prepare data for the first chart.
const preparedData = DataConverter.prepareChartData(rawChartData[0]);

// create a chart with default params.
if (preparedData) {
    const chart = new Chart(preparedData);
    chart.render(document.getElementById('telegram-chart-will-be-here'));
}
```

also, it is possible to pass a custom params to chart, now it support the next properties:

```javaScript

const options = {
    title: 'Title for the chart', // optional, default = ''
    renderQualityRatio: 1, // optional, default = 0.85. render quality from 0 to 1
                           // it works only for screens with pixel ration > 1
    trimAxisY: true, // optional, default = false, chart will trim empty space on render.
};

const chart2 = new Chart(preparedData);
chart2.render(document.getElementById('telegram-chart-will-be-here'));
```

### Chart API

- `constructor(preparedData, options)`
- `render(container: HTMLElement)` - renders the chart to the container as a child
- `switchNightTheme(isNightMode: boolean)` - switch chart to night / day mode

### TODO

- Write proper unit tests for each class, and I will do it soon.
- Add more behaviours for navigation by time / chart.
- Add support of winder range of data, negative values, and part time ranges.
- Add support multi languages, and default language should based on browser language.
- Add more params for customization a chart, and more flexible support of themes.
- Add some other chart like bars, pie and so on.
- Convert the solution to open source project.

## How to build and run

1. Install npm modules
2. Run `npm run build:prod`
3. Open `./demo/demo(1-3).html` in a browser.

## How to run tests

1. Run `npm run test`
