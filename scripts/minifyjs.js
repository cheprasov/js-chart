
const methodsMap = {};
let i = 0;
const getShortMethod = (m) => {
    if (!methodsMap[m]) {
        i += 1;
        while (/^\d/.test(i.toString(36))) {
            i += 1;
        }
        methodsMap[m] = `${i.toString(36)}`;
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

// todo: refactor
const minifyStaticClasses = (source) => {
    let result = source;
    const classes = [
        { name: 'ArrayUtils', methods: { getMinMaxValueBySlice: 'a', getMinMaxValueBySliceArrays: 'b' } },
        { name: 'DateUtils', methods: { getMonDate: 'a', getDayMonDate: 'b' } },
        { name: 'DocumentHelper', methods: { createDivElement: 'a', update: 'b' } },
        { name: 'EventHelper', methods: { getClientX: 'a' } },
        // eslint-disable-next-line
        { name: 'MathUtils', methods: { min: 'a', max: 'b', average: 'c', maxModBy2: 'd', largeRound: 'e', largeFloor: 'f', largeCeil: 'g', formatLargeNumber: 'h' } },
        { name: 'ScreenUtils', methods: { isTouchScreen: 'a', getDevicePixelRatio: 'b' } },
    ];

    classes.forEach((clss) => {
        if (clss.rename) {
            result = result.replace(new RegExp(`(?<!Utils\\/)\\b${clss.name}\\b`, 'g'), clss.rename);
        }
        const className = clss.name || clss.rename;
        Object.entries(clss.methods).forEach(([method, short]) => {
            result = result.replace(new RegExp(`\\bstatic\\s+(${method})\\b`, 'g'), `static ${short}`);
            result = result.replace(new RegExp(`\\b(${className})\\.(${method})\\b`, 'g'), `$1.${short}`);
        });
    });
    console.log(result);
    return result;
};

module.exports = (source) => {
    let result = minifyPrivatePropertiesAndMethods(source);
    result = minifyStaticClasses(result);
    // rename class names

    //console.log(result);
    return result;
};
