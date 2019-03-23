# Telegram March Coding Competition, JavaScript

## About me
Alexander Cheprasov
- email: acheprasov84@gmail.com
- phone: +44 7490 216907
- linkedin: https://uk.linkedin.com/in/alexandercheprasov/

## Demos

### Demo 1. By default
Please see live demo here http://telegram-chart.cheprasov.com/demo1.html

Code of demo: [./demo/demo1.js](demo/demo1.js)

### Demo 2. Using different quality of render.
Please note, the render quality will have effect for screen with `devicePixelRatio > 1`,
by default render quality is 85%. See here http://telegram-chart.cheprasov.com/demo2.html

Code of demo: [./demo/demo2.js](demo/demo2.js)

### Demo 3. Trim data by min & max values:
The chart trims empty spaces and shows lines in full height mode: http://telegram-chart.cheprasov.com/demo3.html

Code of demo: [./demo/demo3.js](demo/demo3.js)

## About the project
The project was created as a solution for Telegram March Coding Competition.

### Tech stack
- JavaScript, ES6, Flow
- Webpack, Nodejs
- Jest

### Used dependencies
I use only one my own library `@cheprasov/web-animation` that I wrote 3 months ago.
It is a small library - 119 lines (97 source lines of code), for executing callbacks on `requestAnimationFrame`.
And I saw no reason to write the similar code again. Please, see more here: https://github.com/cheprasov/js-web-animation
Therefore, It is absolutely true, that the submitted code is written by mе, even the used library.

### Size of Chart.
The lib is compiled to `./dist/chart.js` file and has **65.6 KB** size (network gzip **14.6 KB**).
The file contains JS code and CSS styles.

Also, I think, I can decrease the size to **35-45 KB**, I made some investigation of js minify file, and it can be more compressed.
For example, I wrote small experimental js minifier `./scripts/minifyjs.js` for renaming private properties, methods and static methods,
and it helped to decrease the size on about **8 KB**. Moreover, I sure, it is possible to rename some property names, css class names,
remove (rename) some error messages of module packer.

### Tests
I manually tested work of the code on the latest version of the next browsers:
  - Chrome (Mac)
  - Firefox (Mac)
  - Safari (Mac)
  - Mobile Chrome (Android 9, IPhone 7)
  - Mobile Safari (IPhone 7)

Unfortunately, It was not enough time for writing proper unit tests, but anyway, I will do it soon.

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

- Add support of **WEBGL** context of canvas for drawing charts. Unfortunately, I have not enough experience with pure **WEBGL** for finish it in time.
- Write proper unit tests for each class, and I will do it soon.
- Add more behaviours for navigation by time / chart.
- Add support of winder range of data, also negative values.
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
