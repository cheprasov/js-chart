//const loaderUtils = require('loader-utils');

module.exports = (source) => {
    const result = source
        .replace(/\/\*.*?\*\//g, '') // remove comments
        .replace(/[\t\n]/g, '') // remove tabs and br
        .replace(/([:;{,]) +/g, '$1') // remove spaces
        .replace(/\b(\d+)ms/g, (_, m1) => `${m1 / 1000}s`) // ms => s
        .replace(/([:,])0(\.\d)/g, '$1$2') // 0.42 => .42
        .replace(/#(\w)\1(\w)\2(\w)\3\b/g, '#$1$2$3') // convert colors #AABBCC => #ABC
        .replace(/ +([{])/g, '$1') // remove spaces
        .replace(/ +/g, ' '); // remove spaces

    console.log(result);
    return result;
};

// 200ms
// .2s
