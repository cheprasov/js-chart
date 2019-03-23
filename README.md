# Telegram March Coding Competition, JavaScript

## About me
Alexander Cheprasov
- email: acheprasov84@gmail.com
- phone: +44 7490 216907
- linkedin: https://uk.linkedin.com/in/alexandercheprasov/
- London, UK

## Demos

### Demo 1. By default
Please see live demo here http://telegram-chart.cheprasov.com/demo1.html

Code of demo: [./demo/demo1.js](demo/demo1.js)
    
### Demo 2. Using different quality of render.
Please note, the render quality will have effect for screen with `devicePixelRatio > 1`, see here http://telegram-chart.cheprasov.com/demo2.html

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
For the project I used only my own library `@cheprasov/web-animation` that I wrote 3 months ago.
It is a small library - 119 lines (97 source lines of code), and it helps to executing callbacks on `requestAnimationFrame`.
And I saw no reason to write the similar code again. Please, see more here: https://github.com/cheprasov/js-web-animation
Therefore, It is absolutly true, that the submited code is written by mе, even the used library.

### Size of Chart.
The lib is compiled to `./dist/chart.js` file and has **65.6 KB** size (network gzip **14.6 KB**).
The file containts JS code and CSS styles.

Also, I think, I can decrease the size to **35-45 KB**, I made some investigation of js minify file, and it can be more compressed.
For example, I wrote small experimental js minificator `./scripts/minifyjs.js` for renaming private properties, methods and static methods,
and it helped to decrease the size on about **8 KB**. Moreover, I sure, it is possible to rename some property names, css class names,
remove (rename) some error messages of module packer. 

### Tests
I manually tested work of the code on the lastest version of the next browsers:
  - Chrome (Mac)
  - Firefox (Mac)
  - Safari (Mac)
  - Mobile Chrome (Android 9, IPhone 7)
  - Mobile Safari (IPhone 7)

Unfortunately, It was not enough time for writting proper unit tests, but anyway, I will do it soon.

### Support old browsers
I did not check compatibility with old browsers, but for support them it is possible to add some polyfill library.

### TODO

## How to build and run

1. Install npm modules
2. Run `npm run build:prod`
3. Open `./demo/demo(1-3).html` in a browser.

## How to run tests

1. Run `npm run test`
