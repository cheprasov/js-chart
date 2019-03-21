//const loaderUtils = require('loader-utils');


const methodsMap = {};
let i = 0;
const getShortMethod = (m) => {
    if (!methodsMap[m]) {
        i += 1;
        methodsMap[m] = `f${i.toString(32)}`;
    }
    return methodsMap[m];
};

const minifyPrivatePropertiesAndMethods = (source) => {
    let result = source;
    const privateMethods = result.match(/\b(_[a-zA-Z]{3,})\b/g);
    console.log(privateMethods);
    if (privateMethods) {
        privateMethods.forEach((m) => {
            const rep = getShortMethod(m);
            result = result.replace(new RegExp(`\\b${m}\\b`, 'g'), () => {
                return `${rep}`;
            });
        });
    }

    return result;
};

module.exports = (source) => {
    let result = minifyPrivatePropertiesAndMethods(source);
    // rename static objects/methods
    // rename class names

    console.log(result);
    return result;
};
